'use strict';
/**
 * lib/debate/compile-verdict.js
 * Final verdict pipeline: bias normalization, persuasiveness scoring, tie-breaking,
 * and justification report compilation.
 * Shared by debate-cli.js and index.js.
 */

const {
    BiasSelfAuditJudge,
    PersuasivenessEvaluationJudge,
    TieBreakerResolutionJudge,
    GradeJustificationReportJudge
} = require('./skill-imports');

/**
 * Compute per-agent average across a log array by key.
 * @param {Array}  log   Array of log objects
 * @param {string} key   Property to average
 * @returns {number}
 */
function avg(log, key) {
    return log.length > 0 ? log.reduce((s, i) => s + i[key], 0) / log.length : 1.0;
}

/**
 * Compile the final verdict from all accumulated debate metrics.
 *
 * @param {object} params
 * @param {string}  params.debateSubject
 * @param {number}  params.turns
 * @param {object}  params.factVerifier        EmpiricalFactCheckingJudge instance
 * @param {object}  params.overlapTracker      ClashMapTrackerJudge instance
 * @param {object}  params.fallacyLinterObj    LogicalFallacyDetectionJudge instance
 * @param {object}  params.penaltyMatrix       FallacyWeightingMatrixJudge instance
 * @param {object}  params.livenessWatchdog    WatchdogLivenessMonitorJudge instance
 * @param {object}  params.rawEvaluation       Raw grades from the Gemini model
 * @returns {object}  { finalVerdictResult, scorecardReport, balancedScores }
 */
function compileVerdict(params) {
    const { debateSubject, turns, factVerifier, overlapTracker, fallacyLinterObj, penaltyMatrix, livenessWatchdog, rawEvaluation } = params;

    // 1. Normalize grades (BiasSelfAuditJudge)
    const biasNorm = new BiasSelfAuditJudge(75.0, 10.0);
    const balancedScores = biasNorm.evaluateScoreDrift(
        rawEvaluation.pro_storytelling_grade || 75.0,
        rawEvaluation.con_storytelling_grade || 75.0
    );

    // 2. Compute weighted scorecards (PersuasivenessEvaluationJudge)
    const proFactAvg  = avg(factVerifier.audit_log.filter(l => l.competitor_id === 'pro_agent'), 'truthfulness_ratio');
    const conFactAvg  = avg(factVerifier.audit_log.filter(l => l.competitor_id === 'con_agent'), 'truthfulness_ratio');
    const proClashAvg = avg(overlapTracker.overlap_history.filter(l => l.competitor_id === 'pro_agent'), 'overlap_index');
    const conClashAvg = avg(overlapTracker.overlap_history.filter(l => l.competitor_id === 'con_agent'), 'overlap_index');

    const proLivePenalty = livenessWatchdog.watchdog_violations_log.filter(v => v.competitor_id === 'pro_agent').length * 15.0;
    const conLivePenalty = livenessWatchdog.watchdog_violations_log.filter(v => v.competitor_id === 'con_agent').length * 15.0;
    const proFallPenalty = fallacyLinterObj.violations_history.filter(v => v.competitor_id === 'pro_agent').reduce((s, i) => s + (penaltyMatrix.penalty_matrix[i.fallacy_type] || 2.5), 0.0);
    const conFallPenalty = fallacyLinterObj.violations_history.filter(v => v.competitor_id === 'con_agent').reduce((s, i) => s + (penaltyMatrix.penalty_matrix[i.fallacy_type] || 2.5), 0.0);

    const grader = new PersuasivenessEvaluationJudge();
    const proScorecard = grader.calculateDebateGrade('pro_agent', proClashAvg, proFactAvg, balancedScores.normalized_pro_score, proLivePenalty + proFallPenalty);
    const conScorecard = grader.calculateDebateGrade('con_agent', conClashAvg, conFactAvg, balancedScores.normalized_con_score, conLivePenalty + conFallPenalty);

    // 3. Tie-breaking (TieBreakerResolutionJudge)
    const proFallCount = fallacyLinterObj.violations_history.filter(v => v.competitor_id === 'pro_agent').length;
    const conFallCount = fallacyLinterObj.violations_history.filter(v => v.competitor_id === 'con_agent').length;
    const finalVerdictResult = new TieBreakerResolutionJudge().resolveTie({
        pro_score: proScorecard.final_performance_grade,
        con_score: conScorecard.final_performance_grade,
        pro_fact_ratio: proFactAvg, con_fact_ratio: conFactAvg,
        pro_clash_index: proClashAvg, con_clash_index: conClashAvg,
        pro_fallacies_count: proFallCount, con_fallacies_count: conFallCount
    });

    // 4. Justification report (GradeJustificationReportJudge)
    const violationsLog = [
        ...fallacyLinterObj.violations_history.map(i => ({ round_id: i.round_id, competitor_id: i.competitor_id, fallacy_type: i.fallacy_type, deduction_penalty: penaltyMatrix.penalty_matrix[i.fallacy_type] || 2.5 })),
        ...livenessWatchdog.watchdog_violations_log.map(i => ({ round_id: 1, competitor_id: i.competitor_id, fallacy_type: 'watchdog_liveness_timeout', deduction_penalty: i.score_deduction }))
    ];

    const scorecardReport = new GradeJustificationReportJudge().compileReport({
        debate_subject: debateSubject, total_rounds: turns,
        winner_id: finalVerdictResult.winner_id,
        final_pro_score: finalVerdictResult.final_pro_score,
        final_con_score: finalVerdictResult.final_con_score,
        margin_differential: finalVerdictResult.margin_differential,
        fallacy_infractions_log: violationsLog,
        pro_verified_ratio: proFactAvg, con_verified_ratio: conFactAvg,
        pro_overlap_index: proClashAvg, con_overlap_index: conClashAvg
    });

    return { finalVerdictResult, scorecardReport, balancedScores };
}

module.exports = { compileVerdict };
