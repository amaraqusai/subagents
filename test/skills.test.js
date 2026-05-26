const test = require('node:test');
const assert = require('node:assert');

// Import the Referee/Judge analytical skills
const EmpiricalFactCheckingJudge = require('../src/subagents/skills/empirical_fact_checking_judge/empirical_fact_checking_judge');
const LogicalFallacyDetectionJudge = require('../src/subagents/skills/logical_fallacy_detection_judge/logical_fallacy_detection_judge');
const FallacyWeightingMatrixJudge = require('../src/subagents/skills/fallacy_weighting_matrix_judge/fallacy_weighting_matrix_judge');
const ClashMapTrackerJudge = require('../src/subagents/skills/clash_map_tracker_judge/clash_map_tracker_judge');
const ClosingSummaryAuditorJudge = require('../src/subagents/skills/closing_summary_auditor_judge/closing_summary_auditor_judge');
const BiasSelfAuditJudge = require('../src/subagents/skills/bias_self_audit_judge/bias_self_audit_judge');
const PersuasivenessEvaluationJudge = require('../src/subagents/skills/persuasiveness_evaluation_judge/persuasiveness_evaluation_judge');
const TieBreakerResolutionJudge = require('../src/subagents/skills/tie_breaker_resolution_judge/tie_breaker_resolution_judge');
const GradeJustificationReportJudge = require('../src/subagents/skills/grade_justification_report_judge/grade_justification_report_judge');

test('Referee & Judge Analytical Skills Suite', async (t) => {
    // Shared mock fixtures setup
    const mockVerifiedFactsCache = [
        { keyword: "Champions League goals", truthfulness_score: 1.0 },
        { keyword: "Olympic Gold", truthfulness_score: 1.0 },
        { keyword: "penalty", truthfulness_score: 0.9 },
        { keyword: "Exaggerated Stat", truthfulness_score: 0.2 }
    ];

    const mockHistoricalTurns = [
        { competitor_id: 'pro_agent', speech_text: "Cristiano Ronaldo won major Champions League goals." },
        { competitor_id: 'con_agent', speech_text: "Lionel Messi won Olympic Gold with Argentina in Beijing." }
    ];

    await t.test('Empirical Fact Checking Judge Skill', () => {
        const factChecker = new EmpiricalFactCheckingJudge(mockVerifiedFactsCache);
        
        // Assertions for zero claims
        const emptyResult = factChecker.verifyClaims('pro_agent', [], []);
        assert.strictEqual(emptyResult.truthfulness_ratio, 1.0);
        assert.strictEqual(emptyResult.fact_check_report, 'Zero empirical assertions made during turn.');

        // Assertions with high truthfulness claims
        const truthResult = factChecker.verifyClaims('pro_agent', [
            "He has scored many Champions League goals in his elite career.",
            "Messi won an Olympic Gold medal."
        ], []);
        assert.strictEqual(truthResult.truthfulness_ratio, 1.0);
        assert.strictEqual(truthResult.checked_claims_log.length, 2);
        assert.strictEqual(truthResult.checked_claims_log[0].is_verified, true);

        // Assertions with mixed validity
        const mixedResult = factChecker.verifyClaims('con_agent', [
            "We have this Olympic Gold fact.",
            "This is an Exaggerated Stat."
        ], []);
        // Only Olympic Gold (1.0 >= 0.8) is verified. Exaggerated Stat is 0.2 (< 0.8).
        // VerifiedCount = 1, totalClaims = 2 -> 0.5 ratio
        assert.strictEqual(mixedResult.truthfulness_ratio, 0.5);
    });

    await t.test('Logical Fallacy Detection Skill', () => {
        const fallacyDetector = new LogicalFallacyDetectionJudge();

        // Check logically clean text
        const cleanResult = fallacyDetector.auditSpeechText('pro_agent', 1, "Ronaldo has scored 140 Champions League goals in history.");
        assert.strictEqual(cleanResult.is_logically_unsafe, false);
        assert.strictEqual(cleanResult.verdict_report, 'Speech text is logically clean and sound.');

        // Check text with fallacy (Ad Hominem)
        const fallacyResult = fallacyDetector.auditSpeechText('con_agent', 2, "My opponent is stupid and untrustworthy, therefore their facts are wrong.");
        assert.strictEqual(fallacyResult.is_logically_unsafe, true);
        assert.ok(fallacyResult.verdict_report.includes('committed'));
        const adHominem = fallacyResult.detected_infractions.find(i => i.fallacy_type === 'ad_hominem');
        assert.ok(adHominem);
        assert.strictEqual(adHominem.occurrences_count, 2); // 'stupid', 'untrustworthy'
    });

    await t.test('Fallacy Weighting Matrix Skill', () => {
        const matrix = new FallacyWeightingMatrixJudge();
        
        const infractions = [
            { fallacy_type: 'ad_hominem', occurrences_count: 2 },
            { fallacy_type: 'slippery_slope', occurrences_count: 1 }
        ];

        const result = matrix.calculateFallacyDeductions('con_agent', infractions);
        // ad_hominem penalty: 10.0 * 2 = 20.0
        // slippery_slope penalty: 5.0 * 1 = 5.0
        // Total expected = 25.0
        assert.strictEqual(result.total_score_penalty, 25.0);
        assert.strictEqual(result.deductions_breakdown.length, 2);
    });

    await t.test('Clash-Map Tracker Skill', () => {
        const tracker = new ClashMapTrackerJudge();

        const proSpeech = "Messi has won many Ballon d'Or awards and the World Cup trophy.";
        const conSpeech = "While he won the World Cup, individual Ballon awards are subjective and depend on voter bias.";
        
        const result = tracker.trackResponsiveness('con_agent', conSpeech, proSpeech);
        assert.ok(result.overlap_index > 0.0);
        assert.ok(result.matched_keywords.includes('world'));
        assert.ok(result.matched_keywords.includes('cup'));
    });

    await t.test('Closing Summary Auditor Skill', () => {
        const auditor = new ClosingSummaryAuditorJudge(mockHistoricalTurns);

        // Closing speech without new arguments
        const cleanClosing = "Lionel Messi won Olympic Gold in Beijing, showing dominance.";
        const cleanResult = auditor.auditClosingSpeech('con_agent', cleanClosing);
        assert.strictEqual(cleanResult.has_new_arguments, false);

        // Closing speech injecting new arguments
        const violatingClosing = "Ronaldo won the European Championship, which is the ultimate cup, and also founded a dynamic new blockchain crypto startup.";
        const violatingResult = auditor.auditClosingSpeech('pro_agent', violatingClosing);
        assert.strictEqual(violatingResult.has_new_arguments, true);
        assert.ok(violatingResult.new_terms_spotted.includes('startup') || violatingResult.new_terms_spotted.includes('blockchain'));
    });

    await t.test('Bias Self-Audit Skill', () => {
        const biasAudit = new BiasSelfAuditJudge(75.0, 10.0);

        // Balanced ratings within margins (mean is 75, drift = 0)
        const balancedResult = biasAudit.evaluateScoreDrift(80, 70);
        assert.strictEqual(balancedResult.is_bias_skew_flagged, false);
        assert.strictEqual(balancedResult.normalized_pro_score, 80);
        assert.strictEqual(balancedResult.normalized_con_score, 70);

        // Skewed ratings outside margins (mean is 95, drift = 20 > 10)
        const skewedResult = biasAudit.evaluateScoreDrift(95, 95);
        assert.strictEqual(skewedResult.is_bias_skew_flagged, true);
        assert.strictEqual(skewedResult.correction_applied, -10.0);
        assert.strictEqual(skewedResult.normalized_pro_score, 85.0);
        assert.strictEqual(skewedResult.normalized_con_score, 85.0);
    });

    await t.test('Persuasiveness Evaluation Skill', () => {
        const evaluator = new PersuasivenessEvaluationJudge();

        // Pro: clash 0.8, fact 0.9, rhetoric 85, penalties 5.0
        const gradeResult = evaluator.calculateDebateGrade(
            'pro_agent',
            0.8,
            0.9,
            85.0,
            5.0
        );

        // Expected score: (80 * 0.40) + (90 * 0.35) + (85 * 0.25) - 5.0
        // = 32 + 31.5 + 21.25 - 5.0 = 84.75 - 5.0 = 79.75
        assert.strictEqual(gradeResult.final_performance_grade, 79.75);
    });

    await t.test('Tie-Breaker Resolution Skill', () => {
        const tieBreaker = new TieBreakerResolutionJudge();

        // 1. Natural Winner (No Tie)
        const naturalResult = tieBreaker.resolveTie({
            pro_score: 85.0,
            con_score: 82.0,
            pro_fact_ratio: 0.9,
            con_fact_ratio: 0.8,
            pro_clash_index: 0.7,
            con_clash_index: 0.6,
            pro_fallacies_count: 0,
            con_fallacies_count: 1
        });
        assert.strictEqual(naturalResult.winner_id, 'pro_agent');
        assert.strictEqual(naturalResult.tie_broken, false);
        assert.strictEqual(naturalResult.margin_differential, 3.0);

        // 2. Score Tie broken by Fact Ratio (Citation index)
        const tieFactResult = tieBreaker.resolveTie({
            pro_score: 85.0,
            con_score: 85.0,
            pro_fact_ratio: 0.9,
            con_fact_ratio: 0.8,
            pro_clash_index: 0.7,
            con_clash_index: 0.7,
            pro_fallacies_count: 0,
            con_fallacies_count: 0
        });
        assert.strictEqual(tieFactResult.winner_id, 'pro_agent');
        assert.strictEqual(tieFactResult.tie_broken, true);
        assert.strictEqual(tieFactResult.tie_breaker_applied, 'citation_verification_index');
        assert.strictEqual(tieFactResult.final_pro_score, 85.005);

        // 3. Score Tie broken by Clash Index
        const tieClashResult = tieBreaker.resolveTie({
            pro_score: 85.0,
            con_score: 85.0,
            pro_fact_ratio: 0.8,
            con_fact_ratio: 0.8,
            pro_clash_index: 0.85,
            con_clash_index: 0.9,
            pro_fallacies_count: 0,
            con_fallacies_count: 0
        });
        assert.strictEqual(tieClashResult.winner_id, 'con_agent');
        assert.strictEqual(tieClashResult.tie_broken, true);
        assert.strictEqual(tieClashResult.tie_breaker_applied, 'direct_clash_index');
        assert.strictEqual(tieClashResult.final_con_score, 85.003);

        // 4. Score Tie broken by Fallacy Count (lower is better)
        const tieFallacyResult = tieBreaker.resolveTie({
            pro_score: 85.0,
            con_score: 85.0,
            pro_fact_ratio: 0.8,
            con_fact_ratio: 0.8,
            pro_clash_index: 0.8,
            con_clash_index: 0.8,
            pro_fallacies_count: 0,
            con_fallacies_count: 2
        });
        assert.strictEqual(tieFallacyResult.winner_id, 'pro_agent');
        assert.strictEqual(tieFallacyResult.tie_broken, true);
        assert.strictEqual(tieFallacyResult.tie_breaker_applied, 'fallacy_penalty_count');
        assert.strictEqual(tieFallacyResult.final_pro_score, 85.002);

        // 5. Perfect Parity Tie broken by Stance Precedence Fallback (pro gets boost)
        const tieParityResult = tieBreaker.resolveTie({
            pro_score: 85.0,
            con_score: 85.0,
            pro_fact_ratio: 0.8,
            con_fact_ratio: 0.8,
            pro_clash_index: 0.8,
            con_clash_index: 0.8,
            pro_fallacies_count: 1,
            con_fallacies_count: 1
        });
        assert.strictEqual(tieParityResult.winner_id, 'pro_agent');
        assert.strictEqual(tieParityResult.tie_broken, true);
        assert.strictEqual(tieParityResult.tie_breaker_applied, 'stance_precedence_fallback');
        assert.strictEqual(tieParityResult.final_pro_score, 85.001);

        // 6. Max score boundary overflow handling (does not exceed 100.0)
        const tieMaxResult = tieBreaker.resolveTie({
            pro_score: 100.0,
            con_score: 100.0,
            pro_fact_ratio: 0.9,
            con_fact_ratio: 0.8,
            pro_clash_index: 0.8,
            con_clash_index: 0.8,
            pro_fallacies_count: 0,
            con_fallacies_count: 0
        });
        assert.strictEqual(tieMaxResult.winner_id, 'pro_agent');
        assert.strictEqual(tieMaxResult.tie_broken, true);
        assert.strictEqual(tieMaxResult.final_pro_score, 100.0); // Stays at 100.0 max
        assert.strictEqual(tieMaxResult.final_con_score, 99.995); // Deducted from loser to keep margin intact
        assert.strictEqual(tieMaxResult.margin_differential, 0.005);
    });

    await t.test('Grade Justification Report Skill', () => {
        const reporter = new GradeJustificationReportJudge();

        const report = reporter.compileReport({
            debate_subject: "ronaldo is better than messi",
            total_rounds: 10,
            winner_id: "pro_agent",
            final_pro_score: 85.005,
            final_con_score: 85.0,
            margin_differential: 0.005,
            fallacy_infractions_log: [
                { round_id: 3, competitor_id: "con_agent", fallacy_type: "ad_hominem", deduction_penalty: 10.0 }
            ],
            pro_verified_ratio: 0.9,
            con_verified_ratio: 0.8,
            pro_overlap_index: 0.75,
            con_overlap_index: 0.7
        });

        assert.strictEqual(report.debate_subject, "ronaldo is better than messi");
        assert.strictEqual(report.total_rounds, 10);
        assert.strictEqual(report.verdict.winner_id, "pro_agent");
        assert.strictEqual(report.verdict.final_pro_score, 85.005);
        assert.strictEqual(report.verdict.final_con_score, 85.0);
        assert.strictEqual(report.verdict.margin_differential, 0.005);
        assert.strictEqual(report.fallacy_infractions_log.length, 1);
        assert.strictEqual(report.fallacy_infractions_log[0].deduction_penalty, 10.0);
        assert.strictEqual(report.fact_check_ratios.pro_verified_ratio, 0.9);
        assert.strictEqual(report.clash_responsiveness_score.pro_overlap_index, 0.75);
        assert.ok(report.grading_justification.includes('# ⚖️ Autonomous Multi-Agent Debate'));
        assert.ok(report.grading_justification.includes('Victory'));
    });
});
