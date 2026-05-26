/**
 * Logical Fallacy Protection Skill Module.
 * Adheres strictly to regex-based text analysis and Section 3.2 constraints.
 */

class FallacyProtectionDebator {
  /**
   * Initialize the linter with active debate stance.
   * @param {string} stance - The active debate stance ('affirmative' or 'negative').
   * @throws {ValueError} If stance is not 'affirmative' or 'negative'.
   */
  constructor(stance) {
    if (stance !== 'affirmative' && stance !== 'negative') {
      throw new ValueError("Stance must be 'affirmative' or 'negative'");
    }
    /** @type {string} */
    this.stance = stance;

    /** @type {Object} */
    this.fallacyPatterns = {
      ad_hominem: /\b(stupid|clueless|idiot|untrustworthy|biased because|liar|dishonest)\b/gi,
      slippery_slope: /\b(inevitably lead to|ruin everything|collapse of society|lead to disaster|end of the world)\b/gi,
      circular_reasoning: /\b(true because it is|self-evident because|correct because it says so|proved by the fact that it)\b/gi
    };
  }

  /**
   * Scan the text draft for logical fallacies, returning warning triggers.
   * @param {string} text - Raw statement draft to scan.
   * @returns {Object} Fallacy protection audit log payload.
   */
  auditDraftText(text) {
    const spottedViolations = [];

    for (const [name, regex] of Object.entries(this.fallacyPatterns)) {
      // Reset regex index for global regexes
      regex.lastIndex = 0;
      const matches = text.match(regex);
      if (matches && matches.length > 0) {
        spottedViolations.push({
          fallacy_type: name,
          occurrences_count: matches.length,
          phrases_flagged: matches
        });
      }
    }

    const isViolationFlagged = spottedViolations.length > 0;
    let auditVerdict = 'Text draft is logically sound and clean.';

    if (isViolationFlagged) {
      // Stance-aware dynamic reporting warning
      if (this.stance === 'affirmative') {
        auditVerdict = `[PRO FALLACY AUDIT]: Constructive claim contains fallacies! Found ${spottedViolations.length} issues.`;
      } else if (this.stance === 'negative') {
        auditVerdict = `[CON FALLACY AUDIT]: Counter-rebuttal contains fallacies! Found ${spottedViolations.length} issues.`;
      }
    }

    return {
      stance: this.stance,
      is_flagged_unsafe: isViolationFlagged,
      spotted_violations: spottedViolations,
      fallacy_types_count: spottedViolations.length,
      audit_verdict_report: auditVerdict
    };
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

module.exports = FallacyProtectionDebator;
