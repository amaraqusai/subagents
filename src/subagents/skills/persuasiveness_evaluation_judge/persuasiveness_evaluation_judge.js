/**
 * Persuasiveness Evaluation Judge Skill Module.
 * Adheres strictly to structured scoring models, debate parameters, and Section 3.2.
 */

class PersuasivenessEvaluationJudge {
  /**
   * Initialize the evaluation matrix with default priority weights.
   */
  constructor() {
    /** @type {number} */
    this.clash_weight = 0.40; // Weight given to direct clashing responsiveness
    /** @type {number} */
    this.citations_weight = 0.35; // Weight given to empirical citation factuality
    /** @type {number} */
    this.rhetoric_weight = 0.25; // Weight given to storytelling and rhetoric quality
  }

  /**
   * Audit performance scores, apply weights, deduct infractions penalties, and compute overall grade.
   * @param {string} competitorId - Target competitor identifier.
   * @param {number} clashIndex - Metric value representing direct responsiveness (0.0 to 1.0).
   * @param {number} factualityRatio - Metric value representing factual verity (0.0 to 1.0).
   * @param {number} rhetoricScore - Storytelling quality grade (0.0 to 100.0).
   * @param {number} penaltyDeductibles - Total accumulated score penalty deductibles.
   * @returns {Object} Grading analysis scorecard payload.
   */
  calculateDebateGrade(competitorId, clashIndex, factualityRatio, rhetoricScore, penaltyDeductibles) {
    // Clean parameter ratios
    const cScore = Math.max(Math.min(clashIndex * 100.0, 100.0), 0.0);
    const fScore = Math.max(Math.min(factualityRatio * 100.0, 100.0), 0.0);
    const rScore = Math.max(Math.min(rhetoricScore, 100.0), 0.0);

    // Weighted calculation
    const weightedScore =
      (cScore * this.clash_weight) +
      (fScore * this.citations_weight) +
      (rScore * this.rhetoric_weight);

    // Apply fallacy/liveness score penalties deductibles
    const finalGrade = Math.max(weightedScore - penaltyDeductibles, 0.0);
    const report = `Debate grade calculated for '${competitorId}'. Performance grade: ${finalGrade.toFixed(2)}/100.`;

    return {
      competitor_id: competitorId,
      weighted_clash_score: parseFloat((cScore * this.clash_weight).toFixed(3)),
      weighted_citation_score: parseFloat((fScore * this.citations_weight).toFixed(3)),
      weighted_rhetoric_score: parseFloat((rScore * this.rhetoric_weight).toFixed(3)),
      applied_penalties: penaltyDeductibles,
      final_performance_grade: parseFloat(finalGrade.toFixed(3)),
      evaluation_report: report
    };
  }
}

module.exports = PersuasivenessEvaluationJudge;
