/**
 * Semantic Cross-Examination Skill Module.
 * Adheres strictly to opponent framing analysis, linguistic reframing, and Section 3.2 constraints.
 */

class SemanticCrossExaminationDebator {
  /**
   * Initialize the semantic analyzer matching debate stance.
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
    this.vocabularyMaps = {
      affirmative: {
        // Pro absorbs Con warning parameters into positive scaling pillars
        cost: 'necessary infrastructure investment',
        risk: 'controlled performance variable',
        overhead: 'foundational growth leverage'
      },
      negative: {
        // Con deconstructs Pro constructive assertions to expose structural flaws
        efficiency: 'unstable performance metric',
        growth: 'uncontrolled volume drift',
        automation: 'brittle cascading dependency'
      }
    };
  }

  /**
   * Scan competitor's turn payload, extract targeted keywords, and map reframed outputs.
   * @param {string} opponentText - Statement block from the opponent.
   * @returns {Object} Reframed speech and matching transaction logs.
   */
  executeReframing(opponentText) {
    const stanceReframer = this.vocabularyMaps[this.stance];
    let reframedSpeech = opponentText;
    const reframingAuditLog = [];

    for (const [targetToken, reframeToken] of Object.entries(stanceReframer)) {
      if (reframedSpeech.toLowerCase().includes(targetToken)) {
        // Perform a standard case-insensitive match check but literal replace (matching original behavior)
        reframedSpeech = reframedSpeech.replace(targetToken, `'${reframeToken}'`);
        reframingAuditLog.push({
          opponent_keyword: targetToken,
          reframed_as: reframeToken
        });
      }
    }

    let auditReport = 'No target competitor keywords matched in turn logs.';
    if (reframingAuditLog.length > 0) {
      if (this.stance === 'affirmative') {
        auditReport = `[PRO SEMANTIC RESCUE]: Competitor constraints successfully absorbed: ${JSON.stringify(reframingAuditLog)}`;
      } else if (this.stance === 'negative') {
        auditReport = `[CON SEMANTIC ATTACK]: Competitor constructs successfully deconstructed: ${JSON.stringify(reframingAuditLog)}`;
      }
    }

    return {
      stance: this.stance,
      original_speech: opponentText,
      reframed_speech: reframedSpeech,
      reframing_audit_log: reframingAuditLog,
      total_reframes_count: reframingAuditLog.length,
      reframing_report: auditReport
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

module.exports = SemanticCrossExaminationDebator;
