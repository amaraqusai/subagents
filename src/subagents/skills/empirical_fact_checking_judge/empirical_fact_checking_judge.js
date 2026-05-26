/**
 * Empirical Fact Checking Judge Skill Module.
 * Adheres strictly to empirical audits, search validations, and Section 3.2.
 */

class EmpiricalFactCheckingJudge {
  /**
   * Initialize verifier with verified facts cache.
   * @param {Array<Object>} verifiedFactsCache - List of verified factual entries.
   */
  constructor(verifiedFactsCache) {
    /** @type {Array<Object>} */
    this.cache = verifiedFactsCache;
    /** @type {Array<Object>} */
    this.audit_log = [];
  }

  /**
   * Audit competitor assertions and return a truthfulness index (0.0 to 1.0) based on verified cache matches.
   * @param {string} competitorId - Target competitor identifier.
   * @param {Array<string>} claims - List of competitor assertions.
   * @param {Array<string>} citations - Supporting citations.
   * @returns {Object} Fact check truthfulness payload.
   */
  verifyClaims(competitorId, claims, citations) {
    let verifiedCount = 0;
    const totalClaims = claims ? claims.length : 0;
    const checkedLog = [];

    if (totalClaims === 0) {
      return {
        competitor_id: competitorId,
        truthfulness_ratio: 1.0, // No claims made, net neutral
        checked_claims_log: [],
        fact_check_report: 'Zero empirical assertions made during turn.'
      };
    }

    for (const claim of claims) {
      const claimLower = claim.toLowerCase();
      let matchFound = false;
      let truthValue = 0.0;

      for (const entry of this.cache) {
        const keyword = (entry.keyword || '').toLowerCase();
        if (keyword && claimLower.includes(keyword)) {
          matchFound = true;
          truthValue = entry.truthfulness_score !== undefined ? entry.truthfulness_score : 1.0;
          if (truthValue >= 0.8) {
            verifiedCount += 1;
          }
          break;
        }
      }

      checkedLog.push({
        claim: claim,
        is_verified: matchFound,
        truthfulness_score: truthValue
      });
    }

    const truthRatio = verifiedCount / totalClaims;
    const report = `Factual check completed for '${competitorId}'. Truth index: ${(truthRatio * 100).toFixed(2)}%.`;

    const auditEntry = {
      competitor_id: competitorId,
      claims_count: totalClaims,
      truthfulness_ratio: parseFloat(truthRatio.toFixed(3)),
      report: report
    };
    this.audit_log.push(auditEntry);

    return {
      competitor_id: competitorId,
      truthfulness_ratio: parseFloat(truthRatio.toFixed(3)),
      checked_claims_log: checkedLog,
      fact_check_report: report
    };
  }
}

module.exports = EmpiricalFactCheckingJudge;
