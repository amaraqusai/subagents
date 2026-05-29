const test   = require('node:test');
const assert = require('node:assert');

const EmpiricalFactCheckingJudge   = require('../src/subagents/skills/empirical_fact_checking_judge/empirical_fact_checking_judge');
const LogicalFallacyDetectionJudge = require('../src/subagents/skills/logical_fallacy_detection_judge/logical_fallacy_detection_judge');
const FallacyWeightingMatrixJudge  = require('../src/subagents/skills/fallacy_weighting_matrix_judge/fallacy_weighting_matrix_judge');
const ClashMapTrackerJudge         = require('../src/subagents/skills/clash_map_tracker_judge/clash_map_tracker_judge');
const ClosingSummaryAuditorJudge   = require('../src/subagents/skills/closing_summary_auditor_judge/closing_summary_auditor_judge');

test('Judge Detection Skills', async (t) => {
    const mockVerifiedFactsCache = [
        { keyword: 'Champions League goals', truthfulness_score: 1.0 },
        { keyword: 'Olympic Gold',           truthfulness_score: 1.0 },
        { keyword: 'penalty',                truthfulness_score: 0.9 },
        { keyword: 'Exaggerated Stat',       truthfulness_score: 0.2 }
    ];
    const mockHistoricalTurns = [
        { competitor_id: 'pro_agent', speech_text: 'Cristiano Ronaldo won major Champions League goals.' },
        { competitor_id: 'con_agent', speech_text: 'Lionel Messi won Olympic Gold with Argentina in Beijing.' }
    ];

    await t.test('Empirical Fact Checking Judge Skill', () => {
        const factChecker = new EmpiricalFactCheckingJudge(mockVerifiedFactsCache);

        const emptyResult = factChecker.verifyClaims('pro_agent', [], []);
        assert.strictEqual(emptyResult.truthfulness_ratio, 1.0);
        assert.strictEqual(emptyResult.fact_check_report, 'Zero empirical assertions made during turn.');

        const truthResult = factChecker.verifyClaims('pro_agent', [
            'He has scored many Champions League goals in his elite career.',
            'Messi won an Olympic Gold medal.'
        ], []);
        assert.strictEqual(truthResult.truthfulness_ratio, 1.0);
        assert.strictEqual(truthResult.checked_claims_log.length, 2);
        assert.strictEqual(truthResult.checked_claims_log[0].is_verified, true);

        const mixedResult = factChecker.verifyClaims('con_agent', [
            'We have this Olympic Gold fact.',
            'This is an Exaggerated Stat.'
        ], []);
        assert.strictEqual(mixedResult.truthfulness_ratio, 0.5);
    });

    await t.test('Logical Fallacy Detection Skill', () => {
        const fallacyDetector = new LogicalFallacyDetectionJudge();

        const cleanResult = fallacyDetector.auditSpeechText('pro_agent', 1, 'Ronaldo has scored 140 Champions League goals in history.');
        assert.strictEqual(cleanResult.is_logically_unsafe, false);
        assert.strictEqual(cleanResult.verdict_report, 'Speech text is logically clean and sound.');

        const fallacyResult = fallacyDetector.auditSpeechText('con_agent', 2, 'My opponent is stupid and untrustworthy, therefore their facts are wrong.');
        assert.strictEqual(fallacyResult.is_logically_unsafe, true);
        assert.ok(fallacyResult.verdict_report.includes('committed'));
        const adHominem = fallacyResult.detected_infractions.find(i => i.fallacy_type === 'ad_hominem');
        assert.ok(adHominem);
        assert.strictEqual(adHominem.occurrences_count, 2);
    });

    await t.test('Fallacy Weighting Matrix Skill', () => {
        const matrix = new FallacyWeightingMatrixJudge();
        const infractions = [
            { fallacy_type: 'ad_hominem',    occurrences_count: 2 },
            { fallacy_type: 'slippery_slope', occurrences_count: 1 }
        ];
        const result = matrix.calculateFallacyDeductions('con_agent', infractions);
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

        const cleanResult = auditor.auditClosingSpeech('con_agent', 'Lionel Messi won Olympic Gold in Beijing, showing dominance.');
        assert.strictEqual(cleanResult.has_new_arguments, false);

        const violatingResult = auditor.auditClosingSpeech('pro_agent', 'Ronaldo won the European Championship, and also founded a dynamic new blockchain crypto startup.');
        assert.strictEqual(violatingResult.has_new_arguments, true);
        assert.ok(violatingResult.new_terms_spotted.includes('startup') || violatingResult.new_terms_spotted.includes('blockchain'));
    });
});
