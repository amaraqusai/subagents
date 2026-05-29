require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const logger       = require('./logger');
const Gatekeeper   = require('./gatekeeper');
const Watchdog     = require('./watchdog');
const { showTerminalMenu }   = require('./menu');
const { parseModelJson, loadPersona, printGroundingInfo } = require('./lib/utils');
const { buildSkillsContext }  = require('./lib/debate/build-skills-context');
const { applyLocalSearch, runFallacyProtection, runPerTurnAudits, verifyCitations } = require('./lib/debate/run-turn-audits');
const { compileVerdict }      = require('./lib/debate/compile-verdict');
const { DialogueOrchestrationJudge, WatchdogLivenessMonitorJudge, BackpressureBudgetLimitJudge, CrossExaminationTriggerJudge, SocraticPromptGeneratorJudge, EmpiricalFactCheckingJudge, LogicalFallacyDetectionJudge, FallacyWeightingMatrixJudge, ClashMapTrackerJudge } = require('./lib/debate/skill-imports');

const DEFAULT_MODEL = 'gemini-2.5-flash-lite';
const args = process.argv.slice(2);
let turns = 10, delaySeconds = 15, selectedModel = DEFAULT_MODEL;
for (let i = 0; i < args.length; i++) {
    if (args[i] === '--turns'  || args[i] === '-t') { turns         = parseInt(args[i+1], 10) || 10; i++; }
    if (args[i] === '--delay'  || args[i] === '-d') { delaySeconds  = parseInt(args[i+1], 10) || 15; i++; }
    if (args[i] === '--model'  || args[i] === '-m') { selectedModel = args[i+1] || selectedModel; i++; }
}

let genAI;
if (process.env.GEMINI_API_KEY) genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const PERSONAS  = { ronaldo: loadPersona('ronaldo-fan'), messi: loadPersona('messi-fan'), referee: loadPersona('referee') };
const watchdog  = new Watchdog(45000);
const gatekeeper = new Gatekeeper('gatekeeper_status.json', 0.50);

function getAgentModel(persona, enableSearch = true) {
    if (!genAI) return null;
    return genAI.getGenerativeModel({ model: selectedModel, systemInstruction: persona.systemPrompt, tools: enableSearch ? [{ googleSearch: {} }] : [] });
}
function clearConsoleLine() {
    if (process.stdout.isTTY && typeof process.stdout.clearLine === 'function') { process.stdout.clearLine(0); process.stdout.cursorTo(0); }
    else process.stdout.write('\n');
}
async function callModelWithRetry(model, prompt, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            gatekeeper.checkBudget();
            const result = await watchdog.run('model-generation', () => model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }));
            const parsed = parseModelJson(result.response.text());
            gatekeeper.recordUsage(result.response.usageMetadata);
            return { parsed, candidate: result.response.candidates?.[0] };
        } catch (err) {
            logger.warn('CLI', `Attempt ${attempt}/${maxRetries} failed: ${err.message}`);
            if (attempt === maxRetries) throw err;
            await new Promise(r => setTimeout(r, 15000 * attempt));
        }
    }
}

async function startDebate() {
    if (!process.env.GEMINI_API_KEY) { console.error('\x1b[31m[Error] GEMINI_API_KEY not set.\x1b[0m'); return; }
    const ronaldoModel = getAgentModel(PERSONAS.ronaldo), messiModel = getAgentModel(PERSONAS.messi), refereeModel = getAgentModel(PERSONAS.referee);
    logger.info('CLI', 'Starting live GOAT debate', { turns, model: selectedModel });
    console.log(`\n⚽ \x1b[1m\x1b[32mThe GOAT Debate Starts Now!\x1b[0m ⚽\n  Turns: ${turns} | Model: ${selectedModel} | Delay: ${delaySeconds}s\n`);

    const debateHistory = [], debateSubject = 'Cristiano Ronaldo vs Lionel Messi: The ultimate football GOAT debate';
    let lastResponse = null, opponentDetectedLies = [];
    const orchestrator       = new DialogueOrchestrationJudge(debateSubject, turns);
    const livenessWatchdog   = new WatchdogLivenessMonitorJudge(45.0);
    const backpressureAuditor = new BackpressureBudgetLimitJudge(100000, 30);
    const socraticBuilder    = new SocraticPromptGeneratorJudge(debateSubject);
    const crossExam          = new CrossExaminationTriggerJudge();
    const factVerifier       = new EmpiricalFactCheckingJudge(require('./src/subagents/shared/verified_soccer_facts.json'));
    const fallacyLinterObj   = new LogicalFallacyDetectionJudge();
    const penaltyMatrix      = new FallacyWeightingMatrixJudge();
    const overlapTracker     = new ClashMapTrackerJudge();

    const refStart = await callModelWithRetry(refereeModel, JSON.stringify({ last_speaker: null, last_response: null, opponent_detected_lies: [], debate_history: [] }));
    console.log(`\x1b[36m\x1b[1mThe Referee:\x1b[0m ${refStart.parsed.referee_commentary}\n`);
    debateHistory.push({ speaker: 'Referee', argument: refStart.parsed.referee_commentary });
    let currentSpeaker = refStart.parsed.next_speaker || 'ronaldo-fan';

    for (let turn = 1; turn <= turns * 2; turn++) {
        process.stdout.write(`\x1b[90mWaiting (${delaySeconds}s)...\x1b[0m`);
        await new Promise(r => setTimeout(r, delaySeconds * 1000)); clearConsoleLine();
        const isRonaldo = currentSpeaker === 'ronaldo-fan' || currentSpeaker === 'ronaldo';
        const speakerName = isRonaldo ? PERSONAS.ronaldo.name : PERSONAS.messi.name;
        const color = isRonaldo ? '\x1b[33m' : '\x1b[35m';
        const stance = isRonaldo ? 'affirmative' : 'negative';
        const currentRound = Math.ceil(turn / 2);
        const competitorId = isRonaldo ? 'pro_agent' : 'con_agent';
        console.log(`${color}\x1b[1m${speakerName}:\x1b[0m Thinking...`);

        const skillsContext = buildSkillsContext(stance, currentRound, turns, lastResponse);
        const childPrompt = JSON.stringify({ referee_instructions: debateHistory[debateHistory.length - 1].argument, opponent_argument: lastResponse ? lastResponse.argument : '', debate_history: debateHistory, skills_context: skillsContext });

        if (!backpressureAuditor.checkTokenBudget()) { logger.error('CLI', 'Token quota exceeded.'); break; }
        const watchdogCb = async (p) => callModelWithRetry(isRonaldo ? ronaldoModel : messiModel, p);
        const wdResult = await livenessWatchdog.executeWithLivenessAudit(competitorId, watchdogCb, childPrompt);
        if (wdResult.status === 'liveness_timeout_failure') { currentSpeaker = isRonaldo ? 'messi-fan' : 'ronaldo-fan'; orchestrator.advanceDebateRound(); continue; }

        let childData = wdResult.turn_payload.parsed;
        const bpReport = await backpressureAuditor.auditAndApplyBackpressure(wdResult.turn_payload.candidate?.usageMetadata?.totalTokens || 1000);
        if (bpReport.backpressure_delay_applied > 0) console.log(`  \x1b[33m⏳ [Backpressure] Delayed ${bpReport.backpressure_delay_applied}s\x1b[0m`);

        applyLocalSearch(childData, stance);
        ({ childData } = await runFallacyProtection(childData, stance, childPrompt, callModelWithRetry, isRonaldo ? ronaldoModel : messiModel));
        const audits = runPerTurnAudits({ childData, competitorId, currentRound, totalRounds: turns, lastResponse, debateHistory, fallacyLinterObj, penaltyMatrix, overlapTracker, factVerifier, PERSONAS });
        console.log(`  \x1b[90m📋 Fact: ${audits.factResult.truthfulness_ratio} | Clash: ${audits.responsivenessOverlap} | Fallacy penalty: -${audits.fallacyScorePenalty}\x1b[0m`);

        const trigger = crossExam.evaluateTurnInterruption(childData.argument);
        if (trigger.is_trigger_activated) {
            const challenge = socraticBuilder.compileTargetedSocraticChallenge(isRonaldo ? 'pro' : 'con', currentRound);
            console.log(`\x1b[36m\x1b[1mThe Referee (Socratic):\x1b[0m ${challenge.compiled_socratic_prompt}\n`);
            debateHistory.push({ speaker: 'Referee', argument: challenge.compiled_socratic_prompt });
            await new Promise(r => setTimeout(r, 5000));
            const socWd = await livenessWatchdog.executeWithLivenessAudit(competitorId, watchdogCb, JSON.stringify({ referee_instructions: challenge.compiled_socratic_prompt, opponent_argument: '', debate_history: debateHistory, skills_context: 'Socratic Interrogation — answer with extreme logical precision.' }));
            if (socWd.status !== 'liveness_timeout_failure') { const sd = socWd.turn_payload.parsed; childData.argument += `\n\n*[Socratic Defense]:* ${sd.argument}`; debateHistory.push({ speaker: speakerName, argument: sd.argument }); }
        }

        clearConsoleLine();
        console.log(`${color}\x1b[1m${speakerName}:\x1b[0m\n"${childData.argument}"\n`);
        if (childData.search_query) printGroundingInfo(wdResult.turn_payload.candidate);
        verifyCitations(childData, stance).forEach(r => console.log(`  \x1b[90m🛡️ ${r}\x1b[0m`));
        if (childData.intent_to_bluff_or_lie) console.log(`  \x1b[90m⚡ [Bluff] ${childData.bluff_or_lie_details}\x1b[0m\n`);

        debateHistory.push({ speaker: speakerName, argument: childData.argument });
        lastResponse = childData;
        opponentDetectedLies = childData.lies_or_bluffs_detected || [];

        process.stdout.write(`\x1b[90mReferee analyzing (${delaySeconds}s)...\x1b[0m`);
        await new Promise(r => setTimeout(r, delaySeconds * 1000)); clearConsoleLine();
        console.log('\x1b[36m\x1b[1mReferee:\x1b[0m Evaluating...');
        const refResult = await callModelWithRetry(refereeModel, JSON.stringify({ last_speaker: isRonaldo ? 'ronaldo-fan' : 'messi-fan', last_response: { argument: childData.argument, intent_to_bluff_or_lie: childData.intent_to_bluff_or_lie, bluff_or_lie_details: childData.bluff_or_lie_details }, opponent_detected_lies: opponentDetectedLies, debate_history: debateHistory, local_skills_audits: { competitor_id: competitorId, fact_check_ratio: audits.factResult.truthfulness_ratio, fact_check_report: audits.factResult.fact_check_report, fallacies_detected: audits.refereeFallacyAudit.detected_infractions.map(i => i.fallacy_type), fallacy_score_penalty: audits.fallacyScorePenalty, clash_responsiveness_index: audits.responsivenessOverlap, liveness_violations_count: livenessWatchdog.watchdog_violations_log.filter(v => v.competitor_id === competitorId).length } }));
        clearConsoleLine();
        console.log(`\x1b[36m\x1b[1mThe Referee:\x1b[0m ${refResult.parsed.referee_commentary}`);
        if (refResult.parsed.internal_notes?.analysis_of_last_turn) console.log(`  \x1b[90m📋 ${refResult.parsed.internal_notes.analysis_of_last_turn}\x1b[0m`);
        console.log();
        debateHistory.push({ speaker: 'Referee', argument: refResult.parsed.referee_commentary });
        currentSpeaker = refResult.parsed.next_speaker || (isRonaldo ? 'messi-fan' : 'ronaldo-fan');
        orchestrator.advanceDebateRound();
    }

    process.stdout.write(`\x1b[90mCompiling verdict (${delaySeconds}s)...\x1b[0m`);
    await new Promise(r => setTimeout(r, delaySeconds * 1000)); clearConsoleLine();
    console.log('\x1b[36m\x1b[1mReferee:\x1b[0m Evaluating rhetoric...');
    const evalResult = await callModelWithRetry(refereeModel, `The debate is complete. Evaluate both competitors' rhetorical quality on 0-100 scale. Respond ONLY with: {"pro_storytelling_grade":85.0,"con_storytelling_grade":80.0,"key_rhetoric_findings":"analysis"}`);
    const { scorecardReport } = compileVerdict({ debateSubject, turns, factVerifier, overlapTracker, fallacyLinterObj, penaltyMatrix, livenessWatchdog, rawEvaluation: evalResult.parsed });
    clearConsoleLine();
    console.log(scorecardReport.grading_justification);
    logger.info('CLI', 'Debate finished', { winner: scorecardReport.verdict?.winner_id });
}

function showMenuAndRun() {
    showTerminalMenu('GOAT DEBATE SYSTEM MENU', ['1. Run Live Debate', '2. Run Mock Simulation', '3. View Budget', '4. Run Tests', '5. Reset Budget', '6. Exit'], async (sel) => {
        if (sel === 0) { console.clear(); await startDebate().catch(err => console.error('\x1b[31mFatal:\x1b[0m', err)); console.log('\nPress Enter to return...'); process.stdin.once('data', showMenuAndRun); }
        else if (sel === 1) { console.clear(); try { delete require.cache[require.resolve('./verify_debate_flow')]; require('./verify_debate_flow'); } catch (e) { console.error('Mock error:', e.message); } console.log('\nPress Enter...'); process.stdin.once('data', showMenuAndRun); }
        else if (sel === 2) { console.clear(); const gk = new Gatekeeper(); console.log(`\nBudget: $${gk.estimatedCostUSD.toFixed(6)} / $${gk.budgetLimitUSD.toFixed(4)}\n`); console.log('\nPress Enter...'); process.stdin.once('data', showMenuAndRun); }
        else if (sel === 3) { console.clear(); const { execSync } = require('child_process'); try { execSync('npm test', { stdio: 'inherit' }); } catch {} console.log('\nPress Enter...'); process.stdin.once('data', showMenuAndRun); }
        else if (sel === 4) { console.clear(); new Gatekeeper().resetStatus(); console.log('Budget reset.\n\nPress Enter...'); process.stdin.once('data', showMenuAndRun); }
        else process.exit(0);
    });
}

if (require.main === module) showMenuAndRun();
