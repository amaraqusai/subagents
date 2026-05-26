/**
 * Watchdog Liveness Monitor Judge Skill Module.
 * Adheres strictly to Keep-alive Watchdog tracking, thread safety, and Section 3.2 constraints.
 */

class WatchdogLivenessMonitorJudge {
  /**
   * Initialize liveness watchdog with targeted maximum latency boundaries.
   * @param {number} [timeoutThresholdSeconds=5.0] - Maximum latency threshold.
   * @throws {ValueError} If timeout boundary is not positive.
   */
  constructor(timeoutThresholdSeconds = 5.0) {
    if (timeoutThresholdSeconds <= 0) {
      throw new ValueError('Timeout boundary must be a positive float value.');
    }
    /** @type {number} */
    this.timeoutThresholdSeconds = timeoutThresholdSeconds;
    /** @type {Array<Object>} */
    this.watchdog_violations_log = [];
  }

  /**
   * Execute competitor turn wrapper under active time monitor tracking.
   * Handles timeout limits exceptions and triggers scorecard penalties (Section 8.6).
   * @param {string} competitorId - Target competitor identifier.
   * @param {Function} subagentCallback - Turn callback.
   * @param {...*} args - Dynamic arguments forwarded to target callback.
   * @returns {Promise<Object>|Object} Status payload and latencies metrics.
   */
  async executeWithLivenessAudit(competitorId, subagentCallback, ...args) {
    const executionStart = Date.now();
    try {
      // Execute subagent turn call callback (supporting both sync and async)
      let turnResult = subagentCallback(...args);
      if (turnResult instanceof Promise) {
        turnResult = await turnResult;
      }
      const roundLatency = (Date.now() - executionStart) / 1000.0;

      if (roundLatency > this.timeoutThresholdSeconds) {
        throw new TimeoutError(
          `Subagent latency (${roundLatency.toFixed(2)}s) exceeded timeout threshold (${this.timeoutThresholdSeconds}s).`
        );
      }

      return {
        competitor_id: competitorId,
        status: 'success',
        latency_seconds: parseFloat(roundLatency.toFixed(3)),
        turn_payload: turnResult
      };
    } catch (error) {
      // Audit liveness violations and record grader scorecard deductibles (Section 8.6)
      const penaltyRecord = {
        competitor_id: competitorId,
        timestamp: Date.now() / 1000.0,
        audit_error: error.message || String(error),
        score_deduction: 15.0 // Grade penalty constraint for timeout hangs
      };
      this.watchdog_violations_log.push(penaltyRecord);

      return {
        competitor_id: competitorId,
        status: 'liveness_timeout_failure',
        error_report: error.message || String(error),
        score_deduction: 15.0
      };
    }
  }
}

/**
 * Custom ValueError matching original python interface style.
 * @private
 */
class ValueError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValueError';
  }
}

/**
 * Custom TimeoutError matching original python interface style.
 * @private
 */
class TimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TimeoutError';
  }
}

module.exports = WatchdogLivenessMonitorJudge;
