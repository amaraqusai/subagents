/**
 * Evidence Verification Skill Module.
 * Adheres strictly to local fact-verification logic and Section 3.2 code constraints.
 */

class EvidenceVerificationDebator {
  /**
   * Initialize the verifier with active debate stance.
   * @param {string} stance - The active debate stance ('affirmative' or 'negative').
   * @throws {ValueError} If stance is not 'affirmative' or 'negative'.
   */
  constructor(stance) {
    if (stance !== 'affirmative' && stance !== 'negative') {
      throw new ValueError("Stance must be 'affirmative' or 'negative'");
    }
    /** @type {string} */
    this.stance = stance;
  }

  /**
   * Cross-check citation inputs against verified caching registries.
   * @param {string} citation - The raw citation text.
   * @param {Array<Object>} verifiedCache - Array of verified fact objects.
   * @returns {Object} Fact check auditing payload.
   */
  verifyLocalCitation(citation, verifiedCache) {
    const citationLower = citation.toLowerCase();
    let isVerified = false;
    let truthfulnessRatio = 0.0;
    let statusReport = 'Verification cache miss: empirical citation details unverified.';

    for (const record of verifiedCache) {
      const keyword = (record.keyword || '').toLowerCase();
      if (keyword && citationLower.includes(keyword)) {
        isVerified = true;
        truthfulnessRatio = record.truthfulness_score !== undefined ? record.truthfulness_score : 1.0;
        statusReport = record.fact_check_report || 'Valid empirical profile.';
        break;
      }
    }

    // Stance-shifting dynamic evaluation logic
    if (this.stance === 'affirmative') {
      // Pro agent verifies its own assertions are bulletproof
      if (isVerified && truthfulnessRatio >= 0.8) {
        statusReport = `[PRO INTERGRITY MATCH]: Factual backing verified: ${statusReport}`;
      } else if (isVerified) {
        statusReport = `[PRO WARNING]: Fact has low integrity (${truthfulnessRatio}): ${statusReport}`;
      }
    } else if (this.stance === 'negative') {
      // Con agent audits claims to target logic leaks and exaggerations
      if (isVerified && truthfulnessRatio < 0.8) {
        statusReport = `[CON ATTACK EXPOSE]: Empirical contradiction found: ${statusReport}`;
      } else if (isVerified) {
        statusReport = `[CON AUDIT]: Competitor claim holds valid data: ${statusReport}`;
      }
    }

    return {
      stance: this.stance,
      citation_evaluated: citation,
      is_verified: isVerified,
      truthfulness_index: truthfulnessRatio,
      verification_status_report: statusReport
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

module.exports = EvidenceVerificationDebator;
