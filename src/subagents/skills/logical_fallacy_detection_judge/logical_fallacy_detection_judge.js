/**
 * Logical Fallacy Detection Judge Skill Module.
 * Adheres strictly to fallacy phrase linting, regex parsing, and Section 3.2.
 */

class LogicalFallacyDetectionJudge {
  /**
   * Initialize linter and compile fallacy search regex blocks.
   */
  constructor() {
    /** @type {Object} */
    this.fallacy_patterns = {
      ad_hominem: /\b(stupid|clueless|idiot|untrustworthy|biased because|liar|dishonest)\b/gi,
      slippery_slope: /\b(inevitably lead to|ruin everything|collapse of society|lead to disaster|end of the world)\b/gi,
      circular_reasoning: /\b(true because it is|self-evident because|correct because it says so|proved by the fact that it)\b/gi
    };
    /** @type {Array<Object>} */
    this.violations_history = [];
  }

  /**
   * Scan target competitor turn speech, returning log maps of detected logical fallacies.
   * @param {string} competitorId - Target competitor identifier.
   * @param {number} roundId - Active round sequence ID.
   * @param {string} speechText - The active competitor speech body text.
   * @returns {Object} Fallacy audit report payload.
   */
  auditSpeechText(competitorId, roundId, speechText) {
    const infractions = [];

    for (const [name, regex] of Object.entries(this.fallacy_patterns)) {
      // Reset lastIndex to 0 to prevent state leakage across successive matches
      regex.lastIndex = 0;
      const matches = speechText.match(regex);

      if (matches && matches.length > 0) {
        const infractionEntry = {
          fallacy_type: name,
          occurrences_count: matches.length,
          phrases_flagged: matches
        };
        infractions.push(infractionEntry);

        // Log violation centrally
        this.violations_history.push({
          round_id: roundId,
          competitor_id: competitorId,
          fallacy_type: name,
          phrases: matches
        });
      }
    }

    let verdictReport = 'Speech text is logically clean and sound.';
    if (infractions.length > 0) {
      verdictReport = `[REFEREE LINT ALERT]: Competitor '${competitorId}' committed ${infractions.length} logical infractions.`;
    }

    return {
      competitor_id: competitorId,
      round_id: roundId,
      is_logically_unsafe: infractions.length > 0,
      detected_infractions: infractions,
      verdict_report: verdictReport
    };
  }
}

module.exports = LogicalFallacyDetectionJudge;
