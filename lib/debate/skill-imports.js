'use strict';
/**
 * lib/debate/skill-imports.js
 * Central require() list for all 25 skill modules.
 * Imported by debate-cli.js, index.js, and lib/debate/ sub-modules.
 */

const TimeAllocationStrategyDebator    = require('../../src/subagents/skills/time_allocation_strategy_debator/time_allocation_strategy_debator');
const FallacyProtectionDebator         = require('../../src/subagents/skills/fallacy_protection_debator/fallacy_protection_debator');
const SemanticCrossExaminationDebator  = require('../../src/subagents/skills/semantic_cross_examination_debator/semantic_cross_examination_debator');
const ClarificationDemandDebator       = require('../../src/subagents/skills/clarification_demand_debator/clarification_demand_debator');
const RebuttalGeneratorDebator         = require('../../src/subagents/skills/rebuttal_generator_debator/rebuttal_generator_debator');
const RhetoricalStorytellingDebator    = require('../../src/subagents/skills/rhetorical_storytelling_debator/rhetorical_storytelling_debator');
const ArgumentStructureDebator         = require('../../src/subagents/skills/argument_structure_debator/argument_structure_debator');
const ClosingImpactSummaryDebator      = require('../../src/subagents/skills/closing_impact_summary_debator/closing_impact_summary_debator');
const InternetSearchDebator            = require('../../src/subagents/skills/internet_search_debator/internet_search_debator');
const EvidenceVerificationDebator      = require('../../src/subagents/skills/evidence_verification_debator/evidence_verification_debator');
const ConcessionPivotingDebator        = require('../../src/subagents/skills/concession_pivoting_debator/concession_pivoting_debator');
const DialogueOrchestrationJudge       = require('../../src/subagents/skills/dialogue_orchestration_judge/dialogue_orchestration_judge');
const WatchdogLivenessMonitorJudge     = require('../../src/subagents/skills/watchdog_liveness_monitor_judge/watchdog_liveness_monitor_judge');
const BackpressureBudgetLimitJudge     = require('../../src/subagents/skills/backpressure_budget_limit_judge/backpressure_budget_limit_judge');
const CrossExaminationTriggerJudge     = require('../../src/subagents/skills/cross_examination_trigger_judge/cross_examination_trigger_judge');
const SocraticPromptGeneratorJudge     = require('../../src/subagents/skills/socratic_prompt_generator_judge/socratic_prompt_generator_judge');
const EmpiricalFactCheckingJudge       = require('../../src/subagents/skills/empirical_fact_checking_judge/empirical_fact_checking_judge');
const LogicalFallacyDetectionJudge     = require('../../src/subagents/skills/logical_fallacy_detection_judge/logical_fallacy_detection_judge');
const FallacyWeightingMatrixJudge      = require('../../src/subagents/skills/fallacy_weighting_matrix_judge/fallacy_weighting_matrix_judge');
const ClashMapTrackerJudge             = require('../../src/subagents/skills/clash_map_tracker_judge/clash_map_tracker_judge');
const ClosingSummaryAuditorJudge       = require('../../src/subagents/skills/closing_summary_auditor_judge/closing_summary_auditor_judge');
const BiasSelfAuditJudge               = require('../../src/subagents/skills/bias_self_audit_judge/bias_self_audit_judge');
const PersuasivenessEvaluationJudge    = require('../../src/subagents/skills/persuasiveness_evaluation_judge/persuasiveness_evaluation_judge');
const TieBreakerResolutionJudge        = require('../../src/subagents/skills/tie_breaker_resolution_judge/tie_breaker_resolution_judge');
const GradeJustificationReportJudge    = require('../../src/subagents/skills/grade_justification_report_judge/grade_justification_report_judge');

module.exports = {
    TimeAllocationStrategyDebator, FallacyProtectionDebator,
    SemanticCrossExaminationDebator, ClarificationDemandDebator,
    RebuttalGeneratorDebator, RhetoricalStorytellingDebator,
    ArgumentStructureDebator, ClosingImpactSummaryDebator,
    InternetSearchDebator, EvidenceVerificationDebator,
    ConcessionPivotingDebator, DialogueOrchestrationJudge,
    WatchdogLivenessMonitorJudge, BackpressureBudgetLimitJudge,
    CrossExaminationTriggerJudge, SocraticPromptGeneratorJudge,
    EmpiricalFactCheckingJudge, LogicalFallacyDetectionJudge,
    FallacyWeightingMatrixJudge, ClashMapTrackerJudge,
    ClosingSummaryAuditorJudge, BiasSelfAuditJudge,
    PersuasivenessEvaluationJudge, TieBreakerResolutionJudge,
    GradeJustificationReportJudge
};
