require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const logger = require('./logger');
const Gatekeeper = require('./gatekeeper');
const Watchdog = require('./watchdog');
const { showTerminalMenu } = require('./menu');
const verifiedCache = require('./src/subagents/shared/verified_soccer_facts.json');

// Import competitor-specific _debator skills
const TimeAllocationStrategyDebator = require('./src/subagents/skills/time_allocation_strategy_debator/time_allocation_strategy_debator');
const FallacyProtectionDebator = require('./src/subagents/skills/fallacy_protection_debator/fallacy_protection_debator');
const SemanticCrossExaminationDebator = require('./src/subagents/skills/semantic_cross_examination_debator/semantic_cross_examination_debator');
const ClarificationDemandDebator = require('./src/subagents/skills/clarification_demand_debator/clarification_demand_debator');
const RebuttalGeneratorDebator = require('./src/subagents/skills/rebuttal_generator_debator/rebuttal_generator_debator');
const RhetoricalStorytellingDebator = require('./src/subagents/skills/rhetorical_storytelling_debator/rhetorical_storytelling_debator');
const ArgumentStructureDebator = require('./src/subagents/skills/argument_structure_debator/argument_structure_debator');
const ClosingImpactSummaryDebator = require('./src/subagents/skills/closing_impact_summary_debator/closing_impact_summary_debator');
const InternetSearchDebator = require('./src/subagents/skills/internet_search_debator/internet_search_debator');
const EvidenceVerificationDebator = require('./src/subagents/skills/evidence_verification_debator/evidence_verification_debator');
const ConcessionPivotingDebator = require('./src/subagents/skills/concession_pivoting_debator/concession_pivoting_debator');

// Import Referee/Judge-specific _judge skills
const DialogueOrchestrationJudge = require('./src/subagents/skills/dialogue_orchestration_judge/dialogue_orchestration_judge');
const WatchdogLivenessMonitorJudge = require('./src/subagents/skills/watchdog_liveness_monitor_judge/watchdog_liveness_monitor_judge');
const BackpressureBudgetLimitJudge = require('./src/subagents/skills/backpressure_budget_limit_judge/backpressure_budget_limit_judge');
const CrossExaminationTriggerJudge = require('./src/subagents/skills/cross_examination_trigger_judge/cross_examination_trigger_judge');
const SocraticPromptGeneratorJudge = require('./src/subagents/skills/socratic_prompt_generator_judge/socratic_prompt_generator_judge');
const EmpiricalFactCheckingJudge = require('./src/subagents/skills/empirical_fact_checking_judge/empirical_fact_checking_judge');
const LogicalFallacyDetectionJudge = require('./src/subagents/skills/logical_fallacy_detection_judge/logical_fallacy_detection_judge');
const FallacyWeightingMatrixJudge = require('./src/subagents/skills/fallacy_weighting_matrix_judge/fallacy_weighting_matrix_judge');
const ClashMapTrackerJudge = require('./src/subagents/skills/clash_map_tracker_judge/clash_map_tracker_judge');
const ClosingSummaryAuditorJudge = require('./src/subagents/skills/closing_summary_auditor_judge/closing_summary_auditor_judge');
const BiasSelfAuditJudge = require('./src/subagents/skills/bias_self_audit_judge/bias_self_audit_judge');
const PersuasivenessEvaluationJudge = require('./src/subagents/skills/persuasiveness_evaluation_judge/persuasiveness_evaluation_judge');
const TieBreakerResolutionJudge = require('./src/subagents/skills/tie_breaker_resolution_judge/tie_breaker_resolution_judge');
const GradeJustificationReportJudge = require('./src/subagents/skills/grade_justification_report_judge/grade_justification_report_judge');

// CLI Arguments parsing
const args = process.argv.slice(2);
let turns = 10; // Default 10 turns per side
let delaySeconds = 15; // Default 15s delay to prevent quota issues
let selectedModel = "gemini-2.5-flash-lite"; // Default to 2.5-flash-lite to avoid daily 2.5-flash rate limits

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--turns' || args[i] === '-t') {
        turns = parseInt(args[i+1], 10) || 10;
        i++;
    } else if (args[i] === '--delay' || args[i] === '-d') {
        delaySeconds = parseInt(args[i+1], 10) || 15;
        i++;
    } else if (args[i] === '--model' || args[i] === '-m') {
        selectedModel = args[i+1] || "gemini-2.5-flash";
        i++;
    }
}

let genAI;
if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Load agent persona configurations
function loadPersona(name) {
    const filePath = path.join(__dirname, '.gemini', 'agents', `${name}.md`);
    if (!fs.existsSync(filePath)) {
        logger.error('CLI', `Persona file not found: ${filePath}`);
        console.error(`\x1b[31m[Error] Persona file not found: ${filePath}\x1b[0m`);
        process.exit(1);
    }
    const content = fs.readFileSync(filePath, 'utf8');
    
    const match = content.match(/---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)/);
    if (!match) return { name: name, systemPrompt: content };

    const body = match[2].trim();
    const frontmatter = match[1];
    const nameMatch = frontmatter.match(/name:\s*(.*)/);
    const displayName = nameMatch ? nameMatch[1].trim() : name;

    return {
        name: displayName,
        systemPrompt: body
    };
}

const PERSONAS = {
    ronaldo: loadPersona('ronaldo-fan'),
    messi: loadPersona('messi-fan'),
    referee: loadPersona('referee')
};

// Initialize Gemini models with appropriate system instruction and search grounding
function getAgentModel(persona, enableSearch = true) {
    if (!genAI) return null;
    return genAI.getGenerativeModel({
        model: selectedModel,
        systemInstruction: persona.systemPrompt,
        tools: enableSearch ? [{ googleSearch: {} }] : []
    });
}

// TTY-Safe Console Utilities to prevent crashes in non-interactive environments
function clearConsoleLine() {
    if (process.stdout.isTTY && typeof process.stdout.clearLine === 'function') {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
    } else {
        process.stdout.write('\n');
    }
}

// Global components
const watchdog = new Watchdog(45000); // 45 second timeout for model requests
const gatekeeper = new Gatekeeper('gatekeeper_status.json', 0.50); // $0.50 budget limit

// Robust JSON extraction and parsing
function parseModelJson(text) {
    try {
        const startIdx = text.indexOf("{");
        const endIdx = text.lastIndexOf("}");
        if (startIdx === -1 || endIdx === -1) {
            throw new Error("No JSON object characters found");
        }
        const jsonStr = text.substring(startIdx, endIdx + 1);
        return JSON.parse(jsonStr);
    } catch (err) {
        // Fallback: strip markdown blocks
        let cleaned = text.replace(/```json|```/g, '').trim();
        try {
            return JSON.parse(cleaned);
        } catch (innerErr) {
            throw new Error(`JSON parsing failed: ${err.message}. Original text: ${text.substring(0, 150)}...`);
        }
    }
}

// Call model with watchdog, gatekeeper, and retry mechanisms
async function callModelWithRetry(model, prompt, maxRetries = 3) {
    let baseDelay = 15000;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            // Verify budget before making the call
            gatekeeper.checkBudget();

            // Run task under watchdog supervision
            const result = await watchdog.run('model-generation', async () => {
                const response = await model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }]
                });
                return response;
            });

            const text = result.response.text();
            
            // Validate JSON structure
            const parsed = parseModelJson(text);

            // Record token consumption securely in the gatekeeper
            gatekeeper.recordUsage(result.response.usageMetadata);

            return { parsed, text, candidate: result.response.candidates?.[0] };
        } catch (err) {
            logger.warn('CLI', `Attempt ${attempt}/${maxRetries} failed: ${err.message}`);
            console.warn(`\n\x1b[33m[Warning] Attempt ${attempt}/${maxRetries} failed: ${err.message}\x1b[0m`);
            if (attempt === maxRetries) {
                throw err;
            }
            const waitTime = baseDelay * attempt;
            console.log(`\x1b[90mWaiting ${waitTime / 1000}s before retrying...\x1b[0m`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
}

// Print grounding search query and sources if available
function printGroundingInfo(candidate) {
    const searchQueries = candidate?.groundingMetadata?.webSearchQueries;
    const chunks = candidate?.groundingMetadata?.groundingChunks;
    if (searchQueries && searchQueries.length > 0) {
        console.log(`  \x1b[90m🔍 Search Query: "${searchQueries.join(', ')}"\x1b[0m`);
    }
    if (chunks && chunks.length > 0) {
        const domains = [...new Set(chunks.map(c => {
            try {
                return new URL(c.web?.uri || '').hostname.replace('www.', '');
            } catch (e) {
                return c.web?.title || 'Web Search';
            }
        }))];
        console.log(`  \x1b[90m📚 Sources: ${domains.join(', ')}\x1b[0m`);
    }
}

async function startDebate() {
    if (!process.env.GEMINI_API_KEY) {
        console.error("\x1b[31m[Error] GEMINI_API_KEY is not set in your .env file.\x1b[0m");
        return;
    }

    const ronaldoModel = getAgentModel(PERSONAS.ronaldo, true);
    const messiModel = getAgentModel(PERSONAS.messi, true);
    const refereeModel = getAgentModel(PERSONAS.referee, true);

    logger.info('CLI', 'Starting live GOAT debate', { turns, model: selectedModel });

    console.log("\n========================================================");
    console.log("⚽ \x1b[1m\x1b[32mThe GOAT Debate Starts Now! (Judge Routing & JSON Protocol)\x1b[0m ⚽");
    console.log(`  Turns: ${turns} per side | Model: ${selectedModel} | Delay: ${delaySeconds}s`);
    console.log("========================================================\n");

    const debateHistory = [];
    let lastSpeaker = null;
    let lastResponse = null;
    let opponentDetectedLies = [];

    const debateSubject = "Cristiano Ronaldo vs Lionel Messi: The ultimate football GOAT debate";

    // 1. Dialogue Orchestrator Loop Manager
    const orchestrator = new DialogueOrchestrationJudge(debateSubject, turns);

    // 2. Liveness Watchdog Keep-Alive Monitor
    const livenessWatchdog = new WatchdogLivenessMonitorJudge(45.0);

    // 3. Backpressure economic budget and RPM quota auditor
    const backpressureAuditor = new BackpressureBudgetLimitJudge(100000, 30);

    // 4. Socratic Challenge Generator
    const socraticBuilder = new SocraticPromptGeneratorJudge(debateSubject);

    // 5. Cross-Examination Trigger
    const crossExamInterrupter = new CrossExaminationTriggerJudge();

    // 6. Empirical Fact Checker
    const factVerifier = new EmpiricalFactCheckingJudge(verifiedCache);

    // 7. Logical Fallacy Detector & Penalty Matrix
    const fallacyLinterObj = new LogicalFallacyDetectionJudge();
    const penaltyMatrix = new FallacyWeightingMatrixJudge();

    // 8. Clash Map Tracker (Responsiveness Audit)
    const overlapTracker = new ClashMapTrackerJudge();
    
    // Referee starts the debate
    console.log(`\x1b[36m\x1b[1mReferee:\x1b[0m Thinking...`);
    const refereeStartPrompt = JSON.stringify({
        last_speaker: null,
        last_response: null,
        opponent_detected_lies: [],
        debate_history: []
    });

    const refStartResult = await callModelWithRetry(refereeModel, refereeStartPrompt);
    const refereeData = refStartResult.parsed;
    
    console.log(`\x1b[36m\x1b[1mThe Referee:\x1b[0m ${refereeData.referee_commentary}\n`);
    debateHistory.push({ speaker: "Referee", argument: refereeData.referee_commentary });

    let currentSpeaker = refereeData.next_speaker || 'ronaldo-fan';

    for (let turn = 1; turn <= turns * 2; turn++) {
        // Delay between turns to protect rate limits
        process.stdout.write(`\x1b[90mWaiting for quota (${delaySeconds}s)...\x1b[0m`);
        await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
        clearConsoleLine();

        const isRonaldo = currentSpeaker === 'ronaldo-fan' || currentSpeaker === 'ronaldo';
        const speakerName = isRonaldo ? PERSONAS.ronaldo.name : PERSONAS.messi.name;
        const speakerModel = isRonaldo ? ronaldoModel : messiModel;
        const color = isRonaldo ? '\x1b[33m' : '\x1b[35m';

        console.log(`${color}\x1b[1m${speakerName}:\x1b[0m Thinking...`);

        const stance = isRonaldo ? 'affirmative' : 'negative';
        const currentRound = Math.ceil(turn / 2);

        // 1. Time Allocation Strategy Skill
        const pacer = new TimeAllocationStrategyDebator(stance);
        const pacing = pacer.calculateStrategyBounds(currentRound, turns);

        // 2. Preceding opponent turn analysis (Skills 2, 3, 4, 5)
        let semanticContext = '';
        let clarificationContext = '';
        let rebuttalContext = '';
        let concessionContext = '';

        if (lastResponse && lastResponse.argument) {
            // Semantic Cross-Examination reframing
            const semantic = new SemanticCrossExaminationDebator(stance);
            const reframeResult = semantic.executeReframing(lastResponse.argument);
            if (reframeResult.total_reframes_count > 0) {
                semanticContext = reframeResult.reframing_report;
            }

            // Clarification Demand ambiguity checking
            const clarifier = new ClarificationDemandDebator(stance);
            const demandResult = clarifier.compileClarificationDemand(lastResponse.argument);
            clarificationContext = demandResult.demand_query;

            // Rebuttal Generator targeted clashes
            const rebuttaler = new RebuttalGeneratorDebator(stance);
            const opponentClaims = lastResponse.thought_process?.key_points || [lastResponse.argument.substring(0, 80)];
            const opponentCitationsCount = lastResponse.evidence_citations ? lastResponse.evidence_citations.length : 0;
            const rebuttalResult = rebuttaler.generateRebuttals(opponentClaims, opponentCitationsCount);
            rebuttalContext = rebuttalResult.generated_rebuttals.join('\n');

            // Concession Pivoting transition
            const pivoter = new ConcessionPivotingDebator(stance);
            const pivotResult = pivoter.compileConcessionPivot(lastResponse.argument.substring(0, 80));
            concessionContext = pivotResult.pivot_speech;
        }

        // Compile skills context instructions for the LLM
        let skillsContext = `
[LOCAL SKILLS AUDIT INTERRUPT]:
Your turn is being programmatically managed and audited by your local JS "_debator" skills. You MUST satisfy the following structural directives:
1. Pacing strategy:
   - Round limit: ${pacing.current_round}/${pacing.total_rounds}
   - Word target count limit: ${pacing.word_count_cap} words
   - Active focus parameter: "${pacing.tactical_focus}"
2. Cross-examination & Clashes:
   ${rebuttalContext ? `- Rebuttal guidelines to present:\n${rebuttalContext}` : '- Opening constructive round: focus on laying out your strong core premises.'}
   ${semanticContext ? `- Use this opponent keyword reframe: "${semanticContext}"` : ''}
   ${clarificationContext ? `- Ambiguity clarification demand: "${clarificationContext}"` : ''}
   ${concessionContext ? `- Transition concession pivot: "${concessionContext}"` : ''}
   
[FORMAT INSTRUCTION]: You must add the following additional fields to your output JSON payload:
- "claim": "A brief 1-sentence central claim summarizing your argument."
- "premises": ["Pillar 1", "Pillar 2"] (Array of foundational logical premises, minimum 1)
- "evidence": ["Empirical stat 1", "Empirical stat 2"] (Array of supporting verified figures, optional)
- "impacts": ["Strategic outcome 1", "Strategic outcome 2"] (Array of decisive impacts, optional)
        `.trim();

        if (currentRound === turns) {
            skillsContext += `
\n3. Final Closing Summary:
   - This is the closing summary round! Highlight decisive voter-point clashes.
   - You MUST output additional final-round fields:
     - "primary_wins": ["List of established outcomes you successfully proved."] (Array of strings, minimum 1)
     - "competitor_failures": ["List of critical flaws you exposed in the rival's model."] (Array of strings)
            `.trim();
        }

        // Format prompt for child agent
        const childPrompt = JSON.stringify({
            referee_instructions: debateHistory[debateHistory.length - 1].argument,
            opponent_argument: lastResponse ? lastResponse.argument : "",
            debate_history: debateHistory,
            skills_context: skillsContext
        });

        // Verify budget limit constraints (BackpressureBudgetLimitJudge)
        if (!backpressureAuditor.checkTokenBudget()) {
            logger.error('CLI', 'Backpressure economic session token quota limit exceeded.');
            console.log(`  \x1b[31m⚠️  [Backpressure Abort] Total session token quota limit exceeded! Blocked turn.\x1b[0m`);
            break;
        }

        const competitorId = isRonaldo ? 'pro_agent' : 'con_agent';
        const watchdogCallback = async (prompt) => {
            return await callModelWithRetry(speakerModel, prompt);
        };

        // Run competitor model under Watchdog Liveness keeps-alive (WatchdogLivenessMonitorJudge)
        const watchdogResult = await livenessWatchdog.executeWithLivenessAudit(
            competitorId,
            watchdogCallback,
            childPrompt
        );

        if (watchdogResult.status === 'liveness_timeout_failure') {
            console.log(`  \x1b[31m🐕 [Watchdog Keep-Alive Triggered] Timeout failure detected for '${competitorId}'! Scorecard penalty applied: -15.0 pts.\x1b[0m`);
            currentSpeaker = isRonaldo ? 'messi-fan' : 'ronaldo-fan';
            orchestrator.advanceDebateRound();
            continue;
        }

        let childResult = watchdogResult.turn_payload;
        let childData = childResult.parsed;

        // Record token consumption securely in the backpressure auditor (BackpressureBudgetLimitJudge)
        const currentTokens = childResult.candidate?.usageMetadata?.totalTokens || childResult.parsed?.usageMetadata?.totalTokens || 1000;
        const backpressureReport = await backpressureAuditor.auditAndApplyBackpressure(currentTokens);
        if (backpressureReport.backpressure_delay_applied > 0) {
            console.log(`  \x1b[33m⏳ [Backpressure Spacing] Progressively delayed loop execution by ${backpressureReport.backpressure_delay_applied}s to prevent rate lockout.\x1b[0m`);
        }

        // Trace search queries and run local search grounding (InternetSearchDebator)
        if (childData.search_query) {
            const searcher = new InternetSearchDebator(stance);
            const localSearch = searcher.executeSearch(childData.search_query, verifiedCache);
            if (localSearch.filtered_matches_count > 0) {
                console.log(`  \x1b[92m🌐 [Stance Grounding Cache Match]: "${localSearch.findings[0]}"\x1b[0m`);
                if (!childData.evidence_citations) childData.evidence_citations = [];
                for (let i = 0; i < localSearch.findings.length; i++) {
                    childData.evidence_citations.push({
                        source_url: localSearch.sources[i],
                        extracted_claim: localSearch.findings[i]
                    });
                }
            }
        }

        // Run real-time Factual Check (EmpiricalFactCheckingJudge)
        const claims = childData.claim ? [childData.claim] : [childData.argument.substring(0, 80)];
        const citations = childData.evidence_citations ? childData.evidence_citations.map(c => c.extracted_claim || '') : [];
        const factResult = factVerifier.verifyClaims(competitorId, claims, citations);
        console.log(`  \x1b[90m📋 [Empirical Fact Audit]: Truth Ratio: ${factResult.truthfulness_ratio} | ${factResult.fact_check_report}\x1b[0m`);

        // Run real-time Fallacy Protection Linter (FallacyProtectionDebator)
        const linter = new FallacyProtectionDebator(stance);
        let fallacyAudit = linter.auditDraftText(childData.argument || '');
        let retries = 2;
        while (fallacyAudit.is_flagged_unsafe && retries > 0) {
            console.log(`  \x1b[33m⚡ [Fallacy Protection Blocked Draft] Flagged: ${JSON.stringify(fallacyAudit.spotted_violations)}. Forcing self-correction...\x1b[0m`);
            const recoveryPrompt = `
Your previous response contained logical fallacies and was BLOCKED by your local FallacyProtectionDebator:
"${fallacyAudit.audit_verdict_report}"

You MUST rewrite your argument to be 100% logically sound and clean. Avoid ad hominem attacks (calling your opponent stupid/dishonest), slippery slope, or circular reasoning. Keep your speech structured and highly persuasive!
`.trim();
            const retryResult = await callModelWithRetry(speakerModel, `${childPrompt}\n\n${recoveryPrompt}`);
            childData = retryResult.parsed;
            fallacyAudit = linter.auditDraftText(childData.argument || '');
            retries--;
        }
        if (fallacyAudit.is_flagged_unsafe) {
            console.log(`  \x1b[31m⚠️  [Fallacy Shield Bypassed] A logical loophole escaped correction filter.\x1b[0m`);
        } else {
            console.log(`  \x1b[32m🛡️  [Fallacy Shield Verified] Outgoing speech is audited and logically clean.\x1b[0m`);
        }

        // Run real-time Logical Fallacy Linter (LogicalFallacyDetectionJudge & FallacyWeightingMatrixJudge)
        const refereeFallacyAudit = fallacyLinterObj.auditSpeechText(competitorId, currentRound, childData.argument);
        let fallacyScorePenalty = 0.0;
        if (refereeFallacyAudit.is_logically_unsafe) {
            const fallacyDeduction = penaltyMatrix.calculateFallacyDeductions(competitorId, refereeFallacyAudit.detected_infractions);
            fallacyScorePenalty = fallacyDeduction.total_score_penalty;
            console.log(`  \x1b[31m🚫 [Logical Fallacy Infraction Alert]: Penalty applied: -${fallacyScorePenalty} pts | report: "${fallacyDeduction.penalty_report}"\x1b[0m`);
        } else {
            console.log(`  \x1b[32m🛡️  [Referee Fallacy Audit Verified] Outgoing speech is audited and logically clean.\x1b[0m`);
        }

        // Run real-time Conversational Overlap Map (ClashMapTrackerJudge)
        let responsivenessOverlap = 1.0;
        if (lastResponse && lastResponse.argument) {
            const overlapResult = overlapTracker.trackResponsiveness(competitorId, childData.argument, lastResponse.argument);
            responsivenessOverlap = overlapResult.overlap_index;
            console.log(`  \x1b[90m📋 [Clash Responsiveness Map]: Overlap Index: ${responsivenessOverlap} | ${overlapResult.responsiveness_report}\x1b[0m`);
        }

        // Run real-time Closing Summary Auditing (ClosingSummaryAuditorJudge)
        if (currentRound === turns) {
            const historyLogForAuditor = debateHistory.filter(h => h.speaker !== 'Referee').map(h => ({
                competitor_id: h.speaker === PERSONAS.ronaldo.name ? 'pro_agent' : 'con_agent',
                speech_text: h.argument
            }));
            const closerAuditor = new ClosingSummaryAuditorJudge(historyLogForAuditor);
            const summaryAudit = closerAuditor.auditClosingSpeech(competitorId, childData.argument);
            if (summaryAudit.has_new_arguments) {
                console.log(`  \x1b[31m🚫 [Referee Summary Audit Infraction]: Competitor '${competitorId}' injected new closing arguments! Penalty applied: -10.0 pts.\x1b[0m`);
                fallacyLinterObj.violations_history.push({
                    round_id: currentRound,
                    competitor_id: competitorId,
                    fallacy_type: 'new_arguments_at_closing',
                    phrases: summaryAudit.new_terms_spotted
                });
                penaltyMatrix.total_deductions_applied += 10.0;
            } else {
                console.log(`  \x1b[32m🛡️  [Referee Summary Audit Verified] Closing summary contains no new arguments.\x1b[0m`);
            }
        }

        // Apply Argument Structuring Skill (ArgumentStructureDebator)
        const struct = new ArgumentStructureDebator(stance);
        const structureResult = struct.execute({
            claim: childData.claim || childData.argument.substring(0, 80),
            premises: childData.premises && childData.premises.length > 0 ? childData.premises : [childData.argument.substring(0, 150)],
            evidence: childData.evidence || [],
            impacts: childData.impacts || []
        });

        // Apply Rhetorical Storytelling Skill (RhetoricalStorytellingDebator)
        const story = new RhetoricalStorytellingDebator(stance);
        story.execute(structureResult.speech_markdown);

        // Apply Closing Impact Summary Skill (ClosingImpactSummaryDebator) on final turn
        if (currentRound === turns) {
            const closer = new ClosingImpactSummaryDebator(stance);
            const wins = childData.primary_wins && childData.primary_wins.length > 0 ? childData.primary_wins : ["Our record goals stats", "Our multiple top leagues trophy collection"];
            const leaks = childData.competitor_failures && childData.competitor_failures.length > 0 ? childData.competitor_failures : ["Exposed statistical omissions", "Failing to refute playmaking metrics"];
            closer.compileFinalClosingSpeech(wins, leaks);
        }

        // Run real-time Cross-Examination Interruption trigger (CrossExaminationTriggerJudge & SocraticPromptGeneratorJudge)
        const triggerResult = crossExamInterrupter.evaluateTurnInterruption(childData.argument);
        if (triggerResult.is_trigger_activated) {
            console.log(`  \x1b[33m⚠️  [Cross-Exam Interrupter Triggered] Controversy tag '${triggerResult.matched_alert_token}' spotted. Standard rounds paused.\x1b[0m`);
            
            const stanceShort = isRonaldo ? 'pro' : 'con';
            const challenge = socraticBuilder.compileTargetedSocraticChallenge(stanceShort, currentRound);
            
            clearConsoleLine();
            console.log(`\x1b[36m\x1b[1mThe Referee (Socratic Interrogation):\x1b[0m ${challenge.compiled_socratic_prompt}\n`);
            debateHistory.push({ speaker: "Referee", argument: challenge.compiled_socratic_prompt });
            
            process.stdout.write(`\x1b[90mWaiting for quota (5s)...\x1b[0m`);
            await new Promise(resolve => setTimeout(resolve, 5000));
            clearConsoleLine();
            
            console.log(`${color}\x1b[1m${speakerName} (Socratic Defense):\x1b[0m Thinking...`);
            const interrogatePrompt = JSON.stringify({
                referee_instructions: challenge.compiled_socratic_prompt,
                opponent_argument: "",
                debate_history: debateHistory,
                skills_context: "This is a Socratic Interrogation! Address the referee's question directly with extreme logical precision. No bluffs or evasive phrasing allowed."
            });
            
            const socraticWatchdogResult = await livenessWatchdog.executeWithLivenessAudit(
                competitorId,
                watchdogCallback,
                interrogatePrompt
            );
            
            if (socraticWatchdogResult.status === 'liveness_timeout_failure') {
                 console.log(`  \x1b[31m🐕 [Watchdog Keep-Alive Triggered] Timeout failure detected during Socratic defense! Scorecard penalty applied: -15.0 pts.\x1b[0m`);
            } else {
                 const interrogateResult = socraticWatchdogResult.turn_payload;
                 const interrogateData = interrogateResult.parsed;
                 
                 clearConsoleLine();
                 console.log(`${color}\x1b[1m${speakerName} (Socratic Defense):\x1b[0m ${interrogateData.argument}\n`);
                 debateHistory.push({ speaker: speakerName, argument: interrogateData.argument });
                 
                 childData.argument = `${childData.argument}\n\n*[Socratic Cross-Exam Defense]:* ${interrogateData.argument}`;
            }
        }

        // Clear thinking line and print argument beautifully wrapped in spoken double quotes
        clearConsoleLine();
        console.log(`${color}\x1b[1m${speakerName}:\x1b[0m\n"${childData.argument}"\n`);
        
        // Output search grounding info (InternetSearchDebator)
        if (childData.search_query) {
             printGroundingInfo(childResult.candidate);
        }
        
        // Print real-time citation verification (EvidenceVerificationDebator)
        if (childData.evidence_citations && childData.evidence_citations.length > 0) {
            const verifierObj = new EvidenceVerificationDebator(stance);
            for (const cit of childData.evidence_citations) {
                const audit = verifierObj.verifyLocalCitation(cit.extracted_claim || '', verifiedCache);
                console.log(`  \x1b[90m🛡️ [Evidence Integrity Audit]: ${audit.verification_status_report}\x1b[0m`);
            }
        }
        
        // Print local argument structure node trace (ArgumentStructureDebator)
        const structLabel = stance === 'affirmative' ? 'Constructive Pillar' : 'Defensive Counter-Wedge';
        console.log(`  \x1b[90m🧱 [Argument Structure Node]: Stance: ${stance.charAt(0).toUpperCase() + stance.slice(1)} (${structLabel})`);
        console.log(`     🎯 Claim: ${structureResult.claim_extracted}`);
        console.log(`     💡 Premises: ${childData.premises ? childData.premises.join(', ') : 'Expressed constructive premises'}`);
        if (childData.impacts && childData.impacts.length > 0) {
            console.log(`     💥 Impact: ${childData.impacts.join(', ')}`);
        }
        
        // Print fallacy protection verification status (FallacyProtectionDebator)
        if (fallacyAudit.is_flagged_unsafe) {
            console.log(`  \x1b[31m⚠️  [Fallacy Shield Bypassed] A logical loophole escaped correction filter.\x1b[0m`);
        } else {
            console.log(`  \x1b[32m🛡️  [Fallacy Shield Verified] Outgoing speech is audited and logically clean.\x1b[0m`);
        }
        
        // Print closing summary compilation status (ClosingImpactSummaryDebator)
        if (currentRound === turns) {
            console.log(`  \x1b[32m🏆 [Closing Summary Auditor] Verified: Standardized voter points clash successfully compiled.\x1b[0m`);
        }
        console.log();

        // Check if they tried to bluff/lie
        if (childData.intent_to_bluff_or_lie) {
            console.log(`  \x1b[90m⚡ [Developer Trace] ${speakerName} is BLUFFING/LYING: "${childData.bluff_or_lie_details}"\x1b[0m\n`);
        }

        // Record history
        debateHistory.push({ speaker: speakerName, argument: childData.argument });
        
        lastSpeaker = isRonaldo ? 'ronaldo-fan' : 'messi-fan';
        lastResponse = childData;
        opponentDetectedLies = childData.lies_or_bluffs_detected || [];

        // Route to the Referee (Judge)
        process.stdout.write(`\x1b[90mReferee is analyzing the turn (${delaySeconds}s)...\x1b[0m`);
        await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
        clearConsoleLine();

        console.log(`\x1b[36m\x1b[1mReferee:\x1b[0m Evaluating...`);

        // Inject dynamic real-time audits report directly into the Referee prompt!
        const refereePrompt = JSON.stringify({
            last_speaker: lastSpeaker,
            last_response: {
                argument: lastResponse.argument,
                intent_to_bluff_or_lie: lastResponse.intent_to_bluff_or_lie,
                bluff_or_lie_details: lastResponse.bluff_or_lie_details
            },
            opponent_detected_lies: opponentDetectedLies,
            debate_history: debateHistory,
            local_skills_audits: {
                competitor_id: competitorId,
                fact_check_ratio: factResult.truthfulness_ratio,
                fact_check_report: factResult.fact_check_report,
                fallacies_detected: refereeFallacyAudit.detected_infractions.map(i => i.fallacy_type),
                fallacy_score_penalty: fallacyScorePenalty,
                clash_responsiveness_index: responsivenessOverlap,
                liveness_violations_count: livenessWatchdog.watchdog_violations_log.filter(v => v.competitor_id === competitorId).length
            }
        });

        const refResult = await callModelWithRetry(refereeModel, refereePrompt);
        const refData = refResult.parsed;

        clearConsoleLine();
        console.log(`\x1b[36m\x1b[1mThe Referee:\x1b[0m ${refData.referee_commentary}`);
        if (refData.internal_notes?.analysis_of_last_turn) {
            console.log(`  \x1b[90m📋 [Referee Notes] ${refData.internal_notes.analysis_of_last_turn}\x1b[0m`);
        }
        console.log();

        debateHistory.push({ speaker: "Referee", argument: refData.referee_commentary });
        currentSpeaker = refData.next_speaker || (isRonaldo ? 'messi-fan' : 'ronaldo-fan');
        
        // Manage turn sequence orchestration counters (dialogue_orchestration_judge)
        orchestrator.advanceDebateRound();
    }

    // Debate finished. Referee issues Final Verdict scorecard using vector decisions skills!
    process.stdout.write(`\x1b[90mReferee is compiling core performance evaluation grades (${delaySeconds}s)...\x1b[0m`);
    await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
    clearConsoleLine();

    console.log(`\x1b[36m\x1b[1mReferee:\x1b[0m Evaluating debate history to score rhetoric & storytelling...`);
    
    // 1. Semantic evaluation from Gemini model (rhetoric scorecard grades)
    const evaluationPrompt = `
The debate of ${turns} turns per side is complete. Please review the entire debate history logs, evaluate both competitors' rhetorical storytelling quality and narrative strength on a 0-100 scale.
Respond ONLY with a raw JSON object matching the following structure:
{
  "pro_storytelling_grade": 85.0,
  "con_storytelling_grade": 80.0,
  "key_rhetoric_findings": "Detailed textual analysis of both players' narration."
}
    `.trim();
    const evaluationResult = await callModelWithRetry(refereeModel, evaluationPrompt);
    const rawEvaluation = evaluationResult.parsed;

    // 2. Normalize raw grades using Bias balancing matrix (BiasSelfAuditJudge)
    console.log(`  \x1b[90m⚖️ [Bias Self-Audit] Auditing Referee grades against historic baselines...\x1b[0m`);
    const biasNormalizer = new BiasSelfAuditJudge(75.0, 10.0);
    const balancedScores = biasNormalizer.evaluateScoreDrift(
        rawEvaluation.pro_storytelling_grade || 75.0,
        rawEvaluation.con_storytelling_grade || 75.0
    );
    if (balancedScores.is_bias_skew_flagged) {
        console.log(`  \x1b[33m⚖️ [Bias Balance Applied] Dynamic scorecard adjustments completed. Correction: ${balancedScores.correction_applied} pts.\x1b[0m`);
    }

    // 3. Compute final weighted grades scorecard (PersuasivenessEvaluationJudge)
    console.log(`  \x1b[90m⚖️ [Persuasiveness Scoring] Computing final weighted scorecards...\x1b[0m`);
    const proFactLogs = factVerifier.audit_log.filter(l => l.competitor_id === 'pro_agent');
    const conFactLogs = factVerifier.audit_log.filter(l => l.competitor_id === 'con_agent');
    const proFactAvg = proFactLogs.length > 0 ? (proFactLogs.reduce((sum, item) => sum + item.truthfulness_ratio, 0.0) / proFactLogs.length) : 1.0;
    const conFactAvg = conFactLogs.length > 0 ? (conFactLogs.reduce((sum, item) => sum + item.truthfulness_ratio, 0.0) / conFactLogs.length) : 1.0;

    const proClashLogs = overlapTracker.overlap_history.filter(l => l.competitor_id === 'pro_agent');
    const conClashLogs = overlapTracker.overlap_history.filter(l => l.competitor_id === 'con_agent');
    const proClashAvg = proClashLogs.length > 0 ? (proClashLogs.reduce((sum, item) => sum + item.overlap_index, 0.0) / proClashLogs.length) : 1.0;
    const conClashAvg = conClashLogs.length > 0 ? (conClashLogs.reduce((sum, item) => sum + item.overlap_index, 0.0) / conClashLogs.length) : 1.0;

    // Fetch penalty totals from liveness watchdog & fallacy matrix
    const proLivenessViolations = livenessWatchdog.watchdog_violations_log.filter(v => v.competitor_id === 'pro_agent');
    const proTotalPenalties = proLivenessViolations.length * 15.0 + fallacyLinterObj.violations_history
        .filter(v => v.competitor_id === 'pro_agent')
        .reduce((sum, item) => sum + (penaltyMatrix.penalty_matrix[item.fallacy_type] || 2.5), 0.0);

    const conLivenessViolations = livenessWatchdog.watchdog_violations_log.filter(v => v.competitor_id === 'con_agent');
    const conTotalPenalties = conLivenessViolations.length * 15.0 + fallacyLinterObj.violations_history
        .filter(v => v.competitor_id === 'con_agent')
        .reduce((sum, item) => sum + (penaltyMatrix.penalty_matrix[item.fallacy_type] || 2.5), 0.0);

    const graderObj = new PersuasivenessEvaluationJudge();
    const proScorecard = graderObj.calculateDebateGrade(
        'pro_agent',
        proClashAvg,
        proFactAvg,
        balancedScores.normalized_pro_score,
        proTotalPenalties
    );
    const conScorecard = graderObj.calculateDebateGrade(
        'con_agent',
        conClashAvg,
        conFactAvg,
        balancedScores.normalized_con_score,
        conTotalPenalties
    );

    // 4. Decisive draw-prevention Tie Breaker (TieBreakerResolutionJudge)
    console.log(`  \x1b[90m🔨 [Decisive Tie-Breaker] Verifying score splits & enforcing winner resolution...\x1b[0m`);
    const proFallaciesCount = fallacyLinterObj.violations_history.filter(v => v.competitor_id === 'pro_agent').length;
    const conFallaciesCount = fallacyLinterObj.violations_history.filter(v => v.competitor_id === 'con_agent').length;

    const tieBreakerObj = new TieBreakerResolutionJudge();
    const finalVerdictResult = tieBreakerObj.resolveTie({
        pro_score: proScorecard.final_performance_grade,
        con_score: conScorecard.final_performance_grade,
        pro_fact_ratio: proFactAvg,
        con_fact_ratio: conFactAvg,
        pro_clash_index: proClashAvg,
        con_clash_index: conClashAvg,
        pro_fallacies_count: proFallaciesCount,
        con_fallacies_count: conFallaciesCount
    });

    // 5. Package full stats and compile markdown report (GradeJustificationReportJudge)
    console.log(`  \x1b[90m📄 [Justification Report] Compiling beautiful diagnostics markdown scorecard...\x1b[0m`);
    const reportCompiler = new GradeJustificationReportJudge();
    
    // Map full violations log details for scorecard
    const historyViolationsMapped = fallacyLinterObj.violations_history.map(item => ({
        round_id: item.round_id,
        competitor_id: item.competitor_id,
        fallacy_type: item.fallacy_type,
        deduction_penalty: penaltyMatrix.penalty_matrix[item.fallacy_type] || 2.5
    }));
    livenessWatchdog.watchdog_violations_log.forEach(item => {
        historyViolationsMapped.push({
            round_id: 1,
            competitor_id: item.competitor_id,
            fallacy_type: 'watchdog_liveness_timeout',
            deduction_penalty: item.score_deduction
        });
    });

    const scorecardReport = reportCompiler.compileReport({
        debate_subject: debateSubject,
        total_rounds: turns,
        winner_id: finalVerdictResult.winner_id,
        final_pro_score: finalVerdictResult.final_pro_score,
        final_con_score: finalVerdictResult.final_con_score,
        margin_differential: finalVerdictResult.margin_differential,
        fallacy_infractions_log: historyViolationsMapped,
        pro_verified_ratio: proFactAvg,
        con_verified_ratio: conFactAvg,
        pro_overlap_index: proClashAvg,
        con_overlap_index: conClashAvg
    });

    clearConsoleLine();
    console.log(scorecardReport.grading_justification);

    logger.info('CLI', 'Live GOAT debate finished successfully with local judge evaluation', { winner: finalVerdictResult.winner_id });
}

function showMenuAndRun() {
    const options = [
        "1. Run Live Debate (Gemini API)",
        "2. Run Mock-grounded Simulation (Offline)",
        "3. View Gatekeeper Token & Cost Status",
        "4. Run Unit Tests (TDD)",
        "5. Reset Gatekeeper Budget",
        "6. Exit"
    ];

    showTerminalMenu("GOAT DEBATE SYSTEM MENU", options, async (selection) => {
        if (selection === 0) {
            console.clear();
            await startDebate().catch(err => {
                logger.error('CLI', 'Fatal error during debate', { error: err.message });
                console.error("\x1b[31mFatal Error during debate:\x1b[0m", err);
            });
            console.log("\nPress Enter to return to menu...");
            process.stdin.once('data', () => showMenuAndRun());
        } else if (selection === 1) {
            console.clear();
            try {
                // Remove cached module so we can run it multiple times in the same session
                delete require.cache[require.resolve('./verify_debate_flow')];
                require('./verify_debate_flow');
            } catch (e) {
                console.error("Error running mock simulation:", e.message);
            }
            console.log("\nPress Enter to return to menu...");
            process.stdin.once('data', () => showMenuAndRun());
        } else if (selection === 2) {
            console.clear();
            const gk = new Gatekeeper();
            console.log("\n========================================================");
            console.log("💰 GATEKEEPER BUDGET STATUS 💰");
            console.log("========================================================\n");
            console.log(`Prompt Tokens:      ${gk.promptTokens}`);
            console.log(`Candidates Tokens:  ${gk.candidatesTokens}`);
            console.log(`Total Tokens:       ${gk.totalTokens}`);
            console.log(`Estimated Cost:     $${gk.estimatedCostUSD.toFixed(6)}`);
            console.log(`Budget Limit:       $${gk.budgetLimitUSD.toFixed(4)}`);
            console.log(`Status:             ${gk.estimatedCostUSD >= gk.budgetLimitUSD ? "\x1b[31mEXCEEDED (BLOCKED)\x1b[0m" : "\x1b[32mOK\x1b[0m"}`);
            console.log("\n========================================================");
            console.log("\nPress Enter to return to menu...");
            process.stdin.once('data', () => showMenuAndRun());
        } else if (selection === 3) {
            console.clear();
            console.log("Running npm test...\n");
            const { execSync } = require('child_process');
            try {
                execSync('npm test', { stdio: 'inherit' });
            } catch (e) {
                console.error("Some tests failed.");
            }
            console.log("\nPress Enter to return to menu...");
            process.stdin.once('data', () => showMenuAndRun());
        } else if (selection === 4) {
            console.clear();
            const gk = new Gatekeeper();
            gk.resetStatus();
            console.log("Gatekeeper budget statistics reset to 0.");
            console.log("\nPress Enter to return to menu...");
            process.stdin.once('data', () => showMenuAndRun());
        } else if (selection === 5) {
            console.log("Goodbye!");
            process.exit(0);
        }
    });
}

// Run menu if executed directly from CLI
if (require.main === module) {
    showMenuAndRun();
}
