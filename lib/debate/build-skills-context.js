'use strict';
/**
 * lib/debate/build-skills-context.js
 * Builds the [LOCAL SKILLS AUDIT INTERRUPT] prompt injected into each competitor turn.
 * Used by both debate-cli.js and index.js.
 */

const {
    TimeAllocationStrategyDebator,
    SemanticCrossExaminationDebator,
    ClarificationDemandDebator,
    RebuttalGeneratorDebator,
    ConcessionPivotingDebator
} = require('./skill-imports');

/**
 * Build the skills-context string that is injected into each competitor's prompt.
 * @param {string}       stance        'affirmative' | 'negative'
 * @param {number}       currentRound  Current round index (1-based)
 * @param {number}       totalRounds   Total rounds per side
 * @param {object|null}  lastResponse  The previous speaker's parsed JSON response
 * @returns {string}     The skills context instruction block
 */
function buildSkillsContext(stance, currentRound, totalRounds, lastResponse) {
    const pacer = new TimeAllocationStrategyDebator(stance);
    const pacing = pacer.calculateStrategyBounds(currentRound, totalRounds);

    let semanticContext = '';
    let clarificationContext = '';
    let rebuttalContext = '';
    let concessionContext = '';

    if (lastResponse && lastResponse.argument) {
        const semantic = new SemanticCrossExaminationDebator(stance);
        const reframeResult = semantic.executeReframing(lastResponse.argument);
        if (reframeResult.total_reframes_count > 0) semanticContext = reframeResult.reframing_report;

        const clarifier = new ClarificationDemandDebator(stance);
        clarificationContext = clarifier.compileClarificationDemand(lastResponse.argument).demand_query;

        const rebuttaler = new RebuttalGeneratorDebator(stance);
        const claims = lastResponse.thought_process?.key_points || [lastResponse.argument.substring(0, 80)];
        const citCount = lastResponse.evidence_citations ? lastResponse.evidence_citations.length : 0;
        rebuttalContext = rebuttaler.generateRebuttals(claims, citCount).generated_rebuttals.join('\n');

        const pivoter = new ConcessionPivotingDebator(stance);
        concessionContext = pivoter.compileConcessionPivot(lastResponse.argument.substring(0, 80)).pivot_speech;
    }

    let ctx = `[LOCAL SKILLS AUDIT INTERRUPT]:
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
- "impacts": ["Strategic outcome 1", "Strategic outcome 2"] (Array of decisive impacts, optional)`.trim();

    if (currentRound === totalRounds) {
        ctx += `\n3. Final Closing Summary:
   - This is the closing summary round! Highlight decisive voter-point clashes.
   - You MUST output additional final-round fields:
     - "primary_wins": ["List of established outcomes you successfully proved."] (Array of strings, minimum 1)
     - "competitor_failures": ["List of critical flaws you exposed in the rival's model."] (Array of strings)`.trim();
    }

    return ctx;
}

module.exports = { buildSkillsContext };
