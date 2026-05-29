const test   = require('node:test');
const assert = require('node:assert');

const BiasSelfAuditJudge            = require('../src/subagents/skills/bias_self_audit_judge/bias_self_audit_judge');
const PersuasivenessEvaluationJudge = require('../src/subagents/skills/persuasiveness_evaluation_judge/persuasiveness_evaluation_judge');
const TieBreakerResolutionJudge     = require('../src/subagents/skills/tie_breaker_resolution_judge/tie_breaker_resolution_judge');
const GradeJustificationReportJudge = require('../src/subagents/skills/grade_justification_report_judge/grade_justification_report_judge');

test('Judge Scoring & Reporting Skills', async (t) => {

    await t.test('Bias Self-Audit Skill', () => {
        const biasAudit = new BiasSelfAuditJudge(75.0, 10.0);
        const balancedResult = biasAudit.evaluateScoreDrift(80, 70);
        assert.strictEqual(balancedResult.is_bias_skew_flagged, false);
        assert.strictEqual(balancedResult.normalized_pro_score, 80);
        assert.strictEqual(balancedResult.normalized_con_score, 70);
        const skewedResult = biasAudit.evaluateScoreDrift(95, 95);
        assert.strictEqual(skewedResult.is_bias_skew_flagged, true);
        assert.strictEqual(skewedResult.correction_applied, -10.0);
        assert.strictEqual(skewedResult.normalized_pro_score, 85.0);
        assert.strictEqual(skewedResult.normalized_con_score, 85.0);
    });

    await t.test('Persuasiveness Evaluation Skill', () => {
        const evaluator = new PersuasivenessEvaluationJudge();
        // Expected: (80*0.40) + (90*0.35) + (85*0.25) - 5.0 = 32+31.5+21.25-5.0 = 79.75
        const gradeResult = evaluator.calculateDebateGrade('pro_agent', 0.8, 0.9, 85.0, 5.0);
        assert.strictEqual(gradeResult.final_performance_grade, 79.75);
    });

    await t.test('Tie-Breaker Resolution — natural winner', () => {
        const tieBreaker = new TieBreakerResolutionJudge();
        const result = tieBreaker.resolveTie({ pro_score: 85.0, con_score: 82.0, pro_fact_ratio: 0.9, con_fact_ratio: 0.8, pro_clash_index: 0.7, con_clash_index: 0.6, pro_fallacies_count: 0, con_fallacies_count: 1 });
        assert.strictEqual(result.winner_id, 'pro_agent');
        assert.strictEqual(result.tie_broken, false);
        assert.strictEqual(result.margin_differential, 3.0);
    });

    await t.test('Tie-Breaker — broken by fact ratio', () => {
        const tieBreaker = new TieBreakerResolutionJudge();
        const result = tieBreaker.resolveTie({ pro_score: 85.0, con_score: 85.0, pro_fact_ratio: 0.9, con_fact_ratio: 0.8, pro_clash_index: 0.7, con_clash_index: 0.7, pro_fallacies_count: 0, con_fallacies_count: 0 });
        assert.strictEqual(result.winner_id, 'pro_agent');
        assert.strictEqual(result.tie_broken, true);
        assert.strictEqual(result.tie_breaker_applied, 'citation_verification_index');
        assert.strictEqual(result.final_pro_score, 85.005);
    });

    await t.test('Tie-Breaker — broken by clash index', () => {
        const tieBreaker = new TieBreakerResolutionJudge();
        const result = tieBreaker.resolveTie({ pro_score: 85.0, con_score: 85.0, pro_fact_ratio: 0.8, con_fact_ratio: 0.8, pro_clash_index: 0.85, con_clash_index: 0.9, pro_fallacies_count: 0, con_fallacies_count: 0 });
        assert.strictEqual(result.winner_id, 'con_agent');
        assert.strictEqual(result.tie_breaker_applied, 'direct_clash_index');
        assert.strictEqual(result.final_con_score, 85.003);
    });

    await t.test('Tie-Breaker — broken by fallacy count', () => {
        const tieBreaker = new TieBreakerResolutionJudge();
        const result = tieBreaker.resolveTie({ pro_score: 85.0, con_score: 85.0, pro_fact_ratio: 0.8, con_fact_ratio: 0.8, pro_clash_index: 0.8, con_clash_index: 0.8, pro_fallacies_count: 0, con_fallacies_count: 2 });
        assert.strictEqual(result.winner_id, 'pro_agent');
        assert.strictEqual(result.tie_breaker_applied, 'fallacy_penalty_count');
        assert.strictEqual(result.final_pro_score, 85.002);
    });

    await t.test('Tie-Breaker — stance precedence fallback', () => {
        const tieBreaker = new TieBreakerResolutionJudge();
        const result = tieBreaker.resolveTie({ pro_score: 85.0, con_score: 85.0, pro_fact_ratio: 0.8, con_fact_ratio: 0.8, pro_clash_index: 0.8, con_clash_index: 0.8, pro_fallacies_count: 1, con_fallacies_count: 1 });
        assert.strictEqual(result.winner_id, 'pro_agent');
        assert.strictEqual(result.tie_breaker_applied, 'stance_precedence_fallback');
        assert.strictEqual(result.final_pro_score, 85.001);
    });

    await t.test('Tie-Breaker — max score boundary handling', () => {
        const tieBreaker = new TieBreakerResolutionJudge();
        const result = tieBreaker.resolveTie({ pro_score: 100.0, con_score: 100.0, pro_fact_ratio: 0.9, con_fact_ratio: 0.8, pro_clash_index: 0.8, con_clash_index: 0.8, pro_fallacies_count: 0, con_fallacies_count: 0 });
        assert.strictEqual(result.winner_id, 'pro_agent');
        assert.strictEqual(result.final_pro_score, 100.0);
        assert.strictEqual(result.final_con_score, 99.995);
        assert.strictEqual(result.margin_differential, 0.005);
    });

    await t.test('Grade Justification Report Skill', () => {
        const reporter = new GradeJustificationReportJudge();
        const report = reporter.compileReport({
            debate_subject: 'ronaldo is better than messi', total_rounds: 10,
            winner_id: 'pro_agent', final_pro_score: 85.005, final_con_score: 85.0,
            margin_differential: 0.005,
            fallacy_infractions_log: [{ round_id: 3, competitor_id: 'con_agent', fallacy_type: 'ad_hominem', deduction_penalty: 10.0 }],
            pro_verified_ratio: 0.9, con_verified_ratio: 0.8, pro_overlap_index: 0.75, con_overlap_index: 0.7
        });
        assert.strictEqual(report.debate_subject, 'ronaldo is better than messi');
        assert.strictEqual(report.total_rounds, 10);
        assert.strictEqual(report.verdict.winner_id, 'pro_agent');
        assert.strictEqual(report.verdict.final_pro_score, 85.005);
        assert.strictEqual(report.fallacy_infractions_log.length, 1);
        assert.ok(report.grading_justification.includes('# ⚖️ Autonomous Multi-Agent Debate'));
        assert.ok(report.grading_justification.includes('Victory'));
    });
});
