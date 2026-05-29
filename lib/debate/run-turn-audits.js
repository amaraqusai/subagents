'use strict';
/**
 * lib/debate/run-turn-audits.js
 * Runs all per-turn skill audits (fact-check, fallacy, clash, closing) and returns
 * the audit results. Used by both debate-cli.js and index.js.
 */

const verifiedCache = require('../../src/subagents/shared/verified_soccer_facts.json');

const {
    InternetSearchDebator,
    EmpiricalFactCheckingJudge,
    FallacyProtectionDebator,
    LogicalFallacyDetectionJudge,
    FallacyWeightingMatrixJudge,
    ClashMapTrackerJudge,
    ClosingSummaryAuditorJudge,
    ArgumentStructureDebator,
    RhetoricalStorytellingDebator,
    ClosingImpactSummaryDebator,
    EvidenceVerificationDebator
} = require('./skill-imports');

/**
 * Augment childData with local search grounding results from verifiedCache.
 */
function applyLocalSearch(childData, stance) {
    if (!childData.search_query) return;
    const searcher = new InternetSearchDebator(stance);
    const localSearch = searcher.executeSearch(childData.search_query, verifiedCache);
    if (localSearch.filtered_matches_count > 0) {
        if (!childData.evidence_citations) childData.evidence_citations = [];
        for (let i = 0; i < localSearch.findings.length; i++) {
            childData.evidence_citations.push({ source_url: localSearch.sources[i], extracted_claim: localSearch.findings[i] });
        }
    }
}

/**
 * Run fallacy protection linter and retry up to 2 times on failures.
 * Returns the final fallacyAudit result.
 */
async function runFallacyProtection(childData, stance, childPrompt, callModelWithRetry, speakerModel) {
    const linter = new FallacyProtectionDebator(stance);
    let fallacyAudit = linter.auditDraftText(childData.argument || '');
    let retries = 2;
    while (fallacyAudit.is_flagged_unsafe && retries > 0) {
        const recoveryPrompt = `Your previous response contained logical fallacies and was BLOCKED:\n"${fallacyAudit.audit_verdict_report}"\nRewrite your argument to be 100% logically sound. Avoid ad hominem, slippery slope, or circular reasoning.`.trim();
        const retryResult = await callModelWithRetry(speakerModel, `${childPrompt}\n\n${recoveryPrompt}`);
        childData = retryResult.parsed;
        fallacyAudit = linter.auditDraftText(childData.argument || '');
        retries--;
    }
    return { childData, fallacyAudit };
}

/**
 * Run all per-turn analytical audits and return structured results.
 */
function runPerTurnAudits(params) {
    const { childData, competitorId, currentRound, totalRounds, lastResponse, debateHistory, fallacyLinterObj, penaltyMatrix, overlapTracker, factVerifier, PERSONAS } = params;
    const stance = competitorId === 'pro_agent' ? 'affirmative' : 'negative';

    const claims = childData.claim ? [childData.claim] : [childData.argument.substring(0, 80)];
    const citations = childData.evidence_citations ? childData.evidence_citations.map(c => c.extracted_claim || '') : [];
    const factResult = factVerifier.verifyClaims(competitorId, claims, citations);

    const refereeFallacyAudit = fallacyLinterObj.auditSpeechText(competitorId, currentRound, childData.argument);
    let fallacyScorePenalty = 0.0;
    if (refereeFallacyAudit.is_logically_unsafe) {
        const deduction = penaltyMatrix.calculateFallacyDeductions(competitorId, refereeFallacyAudit.detected_infractions);
        fallacyScorePenalty = deduction.total_score_penalty;
    }

    let responsivenessOverlap = 1.0;
    if (lastResponse && lastResponse.argument) {
        const overlapResult = overlapTracker.trackResponsiveness(competitorId, childData.argument, lastResponse.argument);
        responsivenessOverlap = overlapResult.overlap_index;
    }

    if (currentRound === totalRounds && debateHistory && PERSONAS) {
        const historyLog = debateHistory.filter(h => h.speaker !== 'Referee').map(h => ({
            competitor_id: h.speaker === PERSONAS.ronaldo.name ? 'pro_agent' : 'con_agent',
            speech_text: h.argument
        }));
        const closerAuditor = new ClosingSummaryAuditorJudge(historyLog);
        const summaryAudit = closerAuditor.auditClosingSpeech(competitorId, childData.argument);
        if (summaryAudit.has_new_arguments) {
            fallacyLinterObj.violations_history.push({ round_id: currentRound, competitor_id: competitorId, fallacy_type: 'new_arguments_at_closing', phrases: summaryAudit.new_terms_spotted });
            penaltyMatrix.total_deductions_applied += 10.0;
        }
    }

    const struct = new ArgumentStructureDebator(stance);
    const structureResult = struct.execute({
        claim: childData.claim || childData.argument.substring(0, 80),
        premises: childData.premises && childData.premises.length > 0 ? childData.premises : [childData.argument.substring(0, 150)],
        evidence: childData.evidence || [],
        impacts: childData.impacts || []
    });
    new RhetoricalStorytellingDebator(stance).execute(structureResult.speech_markdown);

    if (currentRound === totalRounds) {
        const closer = new ClosingImpactSummaryDebator(stance);
        const wins = childData.primary_wins?.length > 0 ? childData.primary_wins : ['Our record goals stats'];
        const leaks = childData.competitor_failures?.length > 0 ? childData.competitor_failures : ['Exposed statistical omissions'];
        closer.compileFinalClosingSpeech(wins, leaks);
    }

    return { factResult, refereeFallacyAudit, fallacyScorePenalty, responsivenessOverlap, structureResult };
}

/**
 * Verify evidence citations using the EvidenceVerificationDebator.
 * Returns an array of verification status report strings.
 */
function verifyCitations(childData, stance) {
    if (!childData.evidence_citations || childData.evidence_citations.length === 0) return [];
    const verifierObj = new EvidenceVerificationDebator(stance);
    return childData.evidence_citations.map(cit => verifierObj.verifyLocalCitation(cit.extracted_claim || '', verifiedCache).verification_status_report);
}

module.exports = { applyLocalSearch, runFallacyProtection, runPerTurnAudits, verifyCitations };
