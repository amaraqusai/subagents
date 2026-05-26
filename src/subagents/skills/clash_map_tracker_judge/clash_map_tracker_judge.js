/**
 * Clash-Map Tracker Judge Skill Module.
 * Adheres strictly to direct responsiveness audits, linguistic overlap, and Section 3.2.
 */

class ClashMapTrackerJudge {
  /**
   * Initialize tracker and compile clean token filter lists.
   */
  constructor() {
    /** @type {Set<string>} */
    this.stop_words = new Set(['the', 'a', 'an', 'is', 'are', 'on', 'in', 'to', 'for', 'and', 'but', 'with']);
    /** @type {Array<Object>} */
    this.overlap_history = [];
  }

  /**
   * Sanitize text and extract a clean set of unique keywords.
   * @param {string} text - Speeches text blocks.
   * @returns {Set<string>} Clean unique keywords set.
   * @private
   */
  _extractKeywords(text) {
    const words = text.toLowerCase().match(/\b\w{3,}\b/g) || [];
    const keywords = new Set();
    for (const w of words) {
      if (!this.stop_words.has(w)) {
        keywords.add(w);
      }
    }
    return keywords;
  }

  /**
   * Audit competitor's speech text against opponent's preceding text to compute overlap index.
   * @param {string} competitorId - Target competitor identifier.
   * @param {string} speechText - Active competitor speech.
   * @param {string} opponentSpeechText - Preceding opponent speech.
   * @returns {Object} Responsiveness clash audit payload.
   */
  trackResponsiveness(competitorId, speechText, opponentSpeechText) {
    const currentKeys = this._extractKeywords(speechText);
    const opponentKeys = this._extractKeywords(opponentSpeechText);

    if (opponentKeys.size === 0) {
      return {
        competitor_id: competitorId,
        overlap_index: 1.0, // Opponent has no words, net neutral
        matched_keywords: [],
        responsiveness_report: 'Opponent has empty turn speech. Overlap skipped.'
      };
    }

    // Calculate exact intersection mapping
    const matches = [];
    for (const key of currentKeys) {
      if (opponentKeys.has(key)) {
        matches.push(key);
      }
    }

    const overlapRatio = matches.length / opponentKeys.size;

    // Cap the overlap index logically
    const overlapIndex = Math.min(overlapRatio, 1.0);
    const report = `Clash check completed. direct responsiveness overlap index: ${(overlapIndex * 100).toFixed(2)}%.`;

    this.overlap_history.push({
      competitor_id: competitorId,
      overlap_index: parseFloat(overlapIndex.toFixed(3)),
      matched_keywords: matches
    });

    return {
      competitor_id: competitorId,
      overlap_index: parseFloat(overlapIndex.toFixed(3)),
      matched_keywords: matches,
      responsiveness_report: report
    };
  }
}

module.exports = ClashMapTrackerJudge;
