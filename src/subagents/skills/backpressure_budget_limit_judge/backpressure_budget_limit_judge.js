/**
 * Backpressure Budget Limit Judge Skill Module.
 * Adheres strictly to token auditing, rate-limits, and Section 3.2 constraints.
 */

class BackpressureBudgetLimitJudge {
  /**
   * Initialize the auditor with custom token quotas and rate limit constraints.
   * @param {number} [maxTokenQuota=100000] - Absolute token quota cap.
   * @param {number} [rateLimitRpm=30] - Request rate speed boundary per minute (RPM).
   */
  constructor(maxTokenQuota = 100000, rateLimitRpm = 30) {
    /** @type {number} */
    this.max_token_quota = maxTokenQuota;
    /** @type {number} */
    this.rate_limit_rpm = rateLimitRpm;
    /** @type {number} */
    this.total_tokens_used = 0;
    /** @type {Array<number>} */
    this.request_timestamps = [];
  }

  /**
   * Verify if current token usage sits below the absolute quota ceiling.
   * @returns {boolean} True if under quota ceiling.
   */
  checkTokenBudget() {
    return this.total_tokens_used < this.max_token_quota;
  }

  /**
   * Track turn token consumption and enforce dynamic backpressure delays on threshold overflows.
   * @param {number} turnTokenUsage - Token amount consumed in active debate turn.
   * @returns {Promise<Object>} Backpressure audit payload with latency delays.
   */
  async auditAndApplyBackpressure(turnTokenUsage) {
    this.total_tokens_used += turnTokenUsage;
    this.request_timestamps.push(Date.now() / 1000.0);

    // Filter the sliding window for the last 60 seconds
    const now = Date.now() / 1000.0;
    this.request_timestamps = this.request_timestamps.filter(t => now - t < 60);

    const quotaRatio = this.total_tokens_used / this.max_token_quota;
    const rateRatio = this.request_timestamps.length / this.rate_limit_rpm;

    let delaySeconds = 0.0;

    // Apply progressive backpressure delays on quota milestones
    if (quotaRatio >= 0.9) {
      // Extreme threshold: inject high latency spacer to prevent abrupt lockouts
      delaySeconds = 2.0;
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else if (quotaRatio >= 0.8) {
      // Moderate threshold: inject basic latency spacing
      delaySeconds = 0.5;
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const quotaStatusReport = `Session quota usage: ${(quotaRatio * 100).toFixed(2)}% | Call speed: ${this.request_timestamps.length} RPM.`;

    return {
      total_tokens_used: this.total_tokens_used,
      quota_utilization_ratio: parseFloat(quotaRatio.toFixed(3)),
      rate_utilization_ratio: parseFloat(rateRatio.toFixed(3)),
      backpressure_delay_applied: delaySeconds,
      quota_status_report: quotaStatusReport
    };
  }
}

module.exports = BackpressureBudgetLimitJudge;
