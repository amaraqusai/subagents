/**
 * Bias Self-Audit Judge Skill Module.
 * Adheres strictly to subjective rating balancing, mathematical normalizations, and Section 3.2.
 */

class BiasSelfAuditJudge {
  /**
   * Initialize the auditor with typical evaluation baseline values.
   * @param {number} [historicAvgScore=75.0] - The expected standard rating mean.
   * @param {number} [maxAllowableDrift=15.0] - Allowed variance.
   */
  constructor(historicAvgScore = 75.0, maxAllowableDrift = 15.0) {
    /** @type {number} */
    this.historic_baseline = historicAvgScore;
    /** @type {number} */
    this.max_drift = maxAllowableDrift;
    /** @type {number} */
    this.skew_correction_factor = 0.0;
  }

  /**
   * Audit the raw debate scores, detect grading skew drifts, and apply normalized balance factors.
   * @param {number} rawProScore - Raw affirmative stance grade.
   * @param {number} rawConScore - Raw negative stance grade.
   * @returns {Object} Score drift audit report payload.
   */
  evaluateScoreDrift(rawProScore, rawConScore) {
    const rawMean = (rawProScore + rawConScore) / 2.0;
    const drift = rawMean - this.historic_baseline;

    const isSkewDetected = Math.abs(drift) > this.max_drift;
    let normalizedPro = rawProScore;
    let normalizedCon = rawConScore;
    let correction = 0.0;

    if (isSkewDetected) {
      // Grader score contains subjective shift: calculate normalization offset
      correction = -drift * 0.5;
      normalizedPro = Math.max(Math.min(rawProScore + correction, 100.0), 0.0);
      normalizedCon = Math.max(Math.min(rawConScore + correction, 100.0), 0.0);
      this.skew_correction_factor = correction;
    }

    const report = `Grading check completed. Bias skew flag: ${isSkewDetected}. Normalization: ${correction} points.`;

    return {
      is_bias_skew_flagged: isSkewDetected,
      raw_pro_score: rawProScore,
      raw_con_score: rawConScore,
      normalized_pro_score: parseFloat(normalizedPro.toFixed(3)),
      normalized_con_score: parseFloat(normalizedCon.toFixed(3)),
      correction_applied: parseFloat(correction.toFixed(3)),
      bias_audit_report: report
    };
  }
}

module.exports = BiasSelfAuditJudge;
