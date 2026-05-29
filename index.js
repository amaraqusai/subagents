require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const logger = require('./logger'), Gatekeeper = require('./gatekeeper'), Watchdog = require('./watchdog');
const { parseModelJson, loadPersona, getSearchMetadataString, sendLongMessage } = require('./lib/utils');
const { buildSkillsContext } = require('./lib/debate/build-skills-context');
const { applyLocalSearch, runFallacyProtection, runPerTurnAudits, verifyCitations } = require('./lib/debate/run-turn-audits');
const { compileVerdict } = require('./lib/debate/compile-verdict');
const { DialogueOrchestrationJudge, WatchdogLivenessMonitorJudge, BackpressureBudgetLimitJudge, CrossExaminationTriggerJudge, SocraticPromptGeneratorJudge, EmpiricalFactCheckingJudge, LogicalFallacyDetectionJudge, FallacyWeightingMatrixJudge, ClashMapTrackerJudge } = require('./lib/debate/skill-imports');

const MODEL_NAME = 'gemini-2.5-flash-lite';
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
let genAI;
if (process.env.GEMINI_API_KEY) genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const PERSONAS = { ronaldo: loadPersona('ronaldo-fan'), messi: loadPersona('messi-fan'), referee: loadPersona('referee') };
const watchdog = new Watchdog(45000), gatekeeper = new Gatekeeper('gatekeeper_status.json', 0.50);

function getAgentModel(persona, enableSearch = true) {
    if (!genAI) return null;
    return genAI.getGenerativeModel({ model: MODEL_NAME, systemInstruction: persona.systemPrompt, tools: enableSearch ? [{ googleSearch: {} }] : [] });
}
async function callModelWithRetry(model, prompt, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            gatekeeper.checkBudget();
            const result = await watchdog.run('model-generation-discord', () => model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }));
            const parsed = parseModelJson(result.response.text());
            gatekeeper.recordUsage(result.response.usageMetadata);
            return { parsed, candidate: result.response.candidates?.[0] };
        } catch (err) {
            logger.warn('DiscordBot', `Attempt ${attempt}/${maxRetries} failed: ${err.message}`);
            if (attempt === maxRetries) throw err;
            await new Promise(r => setTimeout(r, 15000 * attempt));
        }
    }
}

let debateActive = false;
client.once('ready', () => { logger.info('DiscordBot', `Logged in as ${client.user.tag}`); console.log(`Logged in as ${client.user.tag}`); });

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    const parts = message.content.trim().split(/\s+/);
    if (parts[0] !== '!debate') return;
    if (debateActive) return message.reply('⚠️ A debate is already in progress!');

    let turns = Math.min(Math.max(parseInt(parts[1], 10) || 10, 1), 15);
    debateActive = true;
    const debateHistory = [], debateSubject = 'Cristiano Ronaldo vs Lionel Messi: The ultimate football GOAT debate';
    let lastResponse = null, opponentDetectedLies = [];

    const orchestrator = new DialogueOrchestrationJudge(debateSubject, turns), livenessWatchdog = new WatchdogLivenessMonitorJudge(45.0);
    const backpressureAuditor = new BackpressureBudgetLimitJudge(100000, 30), socraticBuilder = new SocraticPromptGeneratorJudge(debateSubject);
    const crossExam = new CrossExaminationTriggerJudge(), factVerifier = new EmpiricalFactCheckingJudge(require('./src/subagents/shared/verified_soccer_facts.json'));
    const fallacyLinterObj = new LogicalFallacyDetectionJudge(), penaltyMatrix = new FallacyWeightingMatrixJudge(), overlapTracker = new ClashMapTrackerJudge();

    const ronaldoModel = getAgentModel(PERSONAS.ronaldo), messiModel = getAgentModel(PERSONAS.messi), refereeModel = getAgentModel(PERSONAS.referee);
    logger.info('DiscordBot', 'Starting Discord GOAT debate', { turns, channelId: message.channel.id });
    await message.channel.send(`⚽ **The GOAT Debate Starts Now!** ⚽\n*${turns} turns per side | Model: ${MODEL_NAME}*`);

    try {
        const refStart = await callModelWithRetry(refereeModel, JSON.stringify({ last_speaker: null, last_response: null, opponent_detected_lies: [], debate_history: [] }));
        await message.channel.send(`⚖️ **The Referee:** ${refStart.parsed.referee_commentary}`);
        debateHistory.push({ speaker: 'Referee', argument: refStart.parsed.referee_commentary });
        let currentSpeaker = refStart.parsed.next_speaker || 'ronaldo-fan';

        for (let turn = 1; turn <= turns * 2; turn++) {
            await new Promise(r => setTimeout(r, 15000));
            await message.channel.sendTyping();
            const isRonaldo = currentSpeaker === 'ronaldo-fan' || currentSpeaker === 'ronaldo';
            const speakerName = isRonaldo ? PERSONAS.ronaldo.name : PERSONAS.messi.name;
            const speakerEmoji = isRonaldo ? '🇵🇹' : '🇦🇷';
            const stance = isRonaldo ? 'affirmative' : 'negative';
            const currentRound = Math.ceil(turn / 2);
            const competitorId = isRonaldo ? 'pro_agent' : 'con_agent';
            const speakerModel = isRonaldo ? ronaldoModel : messiModel;

            const skillsContext = buildSkillsContext(stance, currentRound, turns, lastResponse);
            const childPrompt = JSON.stringify({ referee_instructions: debateHistory[debateHistory.length - 1].argument, opponent_argument: lastResponse ? lastResponse.argument : '', debate_history: debateHistory, skills_context: skillsContext });

            if (!backpressureAuditor.checkTokenBudget()) { await message.channel.send('⚠️ Token quota exceeded!'); break; }
            const watchdogCb = async (p) => callModelWithRetry(speakerModel, p);
            const wdResult = await livenessWatchdog.executeWithLivenessAudit(competitorId, watchdogCb, childPrompt);
            if (wdResult.status === 'liveness_timeout_failure') { await message.channel.send(`🐕 Watchdog timeout for **${speakerName}**! -15 pts.`); currentSpeaker = isRonaldo ? 'messi-fan' : 'ronaldo-fan'; orchestrator.advanceDebateRound(); continue; }

            let childData = wdResult.turn_payload.parsed;
            await backpressureAuditor.auditAndApplyBackpressure(wdResult.turn_payload.candidate?.usageMetadata?.totalTokens || 1000);
            applyLocalSearch(childData, stance);
            ({ childData } = await runFallacyProtection(childData, stance, childPrompt, callModelWithRetry, speakerModel));
            const audits = runPerTurnAudits({ childData, competitorId, currentRound, totalRounds: turns, lastResponse, debateHistory, fallacyLinterObj, penaltyMatrix, overlapTracker, factVerifier, PERSONAS });

            const trigger = crossExam.evaluateTurnInterruption(childData.argument);
            if (trigger.is_trigger_activated) {
                const challenge = socraticBuilder.compileTargetedSocraticChallenge(isRonaldo ? 'pro' : 'con', currentRound);
                await message.channel.send(`⚖️ **The Referee (Socratic):** ${challenge.compiled_socratic_prompt}`);
                debateHistory.push({ speaker: 'Referee', argument: challenge.compiled_socratic_prompt });
                await new Promise(r => setTimeout(r, 15000)); await message.channel.sendTyping();
                const socWd = await livenessWatchdog.executeWithLivenessAudit(competitorId, watchdogCb, JSON.stringify({ referee_instructions: challenge.compiled_socratic_prompt, opponent_argument: '', debate_history: debateHistory, skills_context: 'Socratic Interrogation — answer with extreme logical precision.' }));
                if (socWd.status !== 'liveness_timeout_failure') { const sd = socWd.turn_payload.parsed; await message.channel.send(`**${speakerEmoji} ${speakerName} (Socratic Defense):** ${sd.argument}`); debateHistory.push({ speaker: speakerName, argument: sd.argument }); childData.argument += `\n\n*[Socratic Defense]:* ${sd.argument}`; }
            }

            let replyContent = `**${speakerEmoji} ${speakerName}:**\n"${childData.argument}"\n`;
            const searchMeta = getSearchMetadataString(wdResult.turn_payload.candidate);
            if (searchMeta) replyContent += `\n${searchMeta}`;
            verifyCitations(childData, stance).forEach(r => { replyContent += `\n*🛡️ [Evidence Audit]: ${r}*`; });
            const structLabel = stance === 'affirmative' ? 'Constructive Pillar' : 'Defensive Counter-Wedge';
            replyContent += `\n*🧱 [Argument Node]: ${stance} (${structLabel}) — Claim: ${audits.structureResult.claim_extracted}*`;
            if (childData.impacts?.length > 0) replyContent += `\n*• Impact: ${childData.impacts.join(', ')}*`;
            replyContent += audits.fallacyScorePenalty > 0 ? `\n*⚠️ [Fallacy Penalty] -${audits.fallacyScorePenalty} pts*` : `\n*🛡️ [Fallacy Shield] Verified clean.*`;
            if (currentRound === turns) replyContent += `\n*🏆 [Closing Summary] Voter-point clashes compiled.*`;
            await message.channel.send(replyContent);

            debateHistory.push({ speaker: speakerName, argument: childData.argument });
            lastResponse = childData;
            opponentDetectedLies = childData.lies_or_bluffs_detected || [];

            await new Promise(r => setTimeout(r, 15000)); await message.channel.sendTyping();
            const refResult = await callModelWithRetry(refereeModel, JSON.stringify({ last_speaker: isRonaldo ? 'ronaldo-fan' : 'messi-fan', last_response: { argument: childData.argument, intent_to_bluff_or_lie: childData.intent_to_bluff_or_lie, bluff_or_lie_details: childData.bluff_or_lie_details }, opponent_detected_lies: opponentDetectedLies, debate_history: debateHistory, local_skills_audits: { competitor_id: competitorId, fact_check_ratio: audits.factResult.truthfulness_ratio, fact_check_report: audits.factResult.fact_check_report, fallacies_detected: audits.refereeFallacyAudit.detected_infractions.map(i => i.fallacy_type), fallacy_score_penalty: audits.fallacyScorePenalty, clash_responsiveness_index: audits.responsivenessOverlap, liveness_violations_count: livenessWatchdog.watchdog_violations_log.filter(v => v.competitor_id === competitorId).length } }));
            let refereeReply = `⚖️ **The Referee:** ${refResult.parsed.referee_commentary}`;
            if (refResult.parsed.internal_notes?.analysis_of_last_turn) refereeReply += `\n*(Notes: ${refResult.parsed.internal_notes.analysis_of_last_turn})*`;
            await message.channel.send(refereeReply);
            debateHistory.push({ speaker: 'Referee', argument: refResult.parsed.referee_commentary });
            currentSpeaker = refResult.parsed.next_speaker || (isRonaldo ? 'messi-fan' : 'ronaldo-fan');
            orchestrator.advanceDebateRound();
        }

        await new Promise(r => setTimeout(r, 15000)); await message.channel.sendTyping();
        await message.channel.send('⚖️ **Referee is compiling the Final Verdict...** ⚖️');
        const evalResult = await callModelWithRetry(refereeModel, `The debate is complete. Evaluate both competitors' rhetorical quality on 0-100. Respond ONLY with: {"pro_storytelling_grade":85.0,"con_storytelling_grade":80.0,"key_rhetoric_findings":"analysis"}`);
        const { finalVerdictResult, scorecardReport } = compileVerdict({ debateSubject, turns, factVerifier, overlapTracker, fallacyLinterObj, penaltyMatrix, livenessWatchdog, rawEvaluation: evalResult.parsed });
        await sendLongMessage(message.channel.send.bind(message.channel), scorecardReport.grading_justification);
        await message.channel.send('🏁 **The Debate has officially closed!** 🏁');
        logger.info('DiscordBot', 'Debate completed', { winner: finalVerdictResult?.winner_id });

    } catch (err) {
        logger.error('DiscordBot', `Orchestration error: ${err.message}`);
        await message.channel.send(`❌ **Error:** ${err.message}. Debate aborted.`);
    } finally {
        debateActive = false;
    }
});

if (require.main === module) {
    client.login(process.env.DISCORD_TOKEN).catch(err => { logger.error('DiscordBot', `Login failed: ${err.message}`); console.error('Login failed:', err.message); });
}
