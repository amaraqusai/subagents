/**
 * Logical Fallacy Weighting Matrix Skill Module.
 * Adheres strictly to dynamic penalty matrices, deductibles, and Section 3.2.
 */

class FallacyWeightingMatrixJudge {
  /**
   * Initialize matrix with fallback default penalty multipliers.
   * @param {Object} [targetDeductionsMap=null] - Custom penalty map.
   */
  constructor(targetDeductionsMap = null) {
    /** @type {Object} */
    this.penalty_matrix = targetDeductionsMap || {
      ad_hominem: 10.0, // High penalty for personal attacks
      slippery_slope: 5.0, // Moderate penalty for scaling extrapolations
      circular_reasoning: 7.5, // Medium-high penalty for logic loops
      generic_fallacy: 2.5 // Default fallback penalty
    };
    /** @type {number} */
    this.total_deductions_applied = 0.0;
  }

  /**
   * Audit competitor Turn logical infraction list, calculate overall penalty, and log results.
   * @param {string} competitorId - Target competitor identifier.
   * @param {Array<Object>} infractions - List of competitor logical infractions.
   * @returns {Object} Infraction penalty calculation report payload.
   */
  calculateFallacyDeductions(competitorId, infractions) {
    let totalPenalty = 0.0;
    const details = [];

    for (const item of infractions) {
      const fallacyType = item.fallacy_type || 'generic_fallacy';
      const occurrences = item.occurrences_count !== undefined ? item.occurrences_count : 1;

      // Map dynamic penalty weighting multiplier
      const multiplier = this.penalty_matrix[fallacyType] !== undefined
        ? this.penalty_matrix[fallacyType]
        : this.penalty_matrix.generic_fallacy;

      const deduction = multiplier * occurrences;
      totalPenalty += deduction;

      details.push({
        fallacy_type: fallacyType,
        occurrences: occurrences,
        penalty_multiplier: multiplier,
        total_deduction: deduction
      });
    }

    this.total_deductions_applied += totalPenalty;
    const report = `Logical audit completed for '${competitorId}'. Total score penalty: -${totalPenalty} points.`;

    return {
      competitor_id: competitorId,
      total_score_penalty: parseFloat(totalPenalty.toFixed(3)),
      deductions_breakdown: details,
      penalty_report: report
    };
  }
}

module.exports = FallacyWeightingMatrixJudge;
