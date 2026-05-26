/**
 * Closing Summary Auditor Judge Skill Module.
 * Adheres strictly to closing round rules, new logic detection, and Section 3.2.
 */

class ClosingSummaryAuditorJudge {
  /**
   * Initialize the auditor and compile standard vocabulary logs from historical turns.
   * @param {Array<Object>} historicalTurnsLog - Past speech metrics/logs.
   */
  constructor(historicalTurnsLog) {
    /** @type {Set<string>} */
    this.stop_words = new Set(['the', 'a', 'an', 'is', 'are', 'on', 'in', 'to', 'for', 'and', 'but', 'with']);
    /** @type {Set<string>} */
    this.historical_keywords = new Set();
    this._compileHistory(historicalTurnsLog);
  }

  /**
   * Extract and compile a unified set of unique keywords across historical speech turns.
   * @param {Array<Object>} history - Historical turn logs list.
   * @private
   */
  _compileHistory(history) {
    for (const turn of history) {
      const speech = turn.speech_text || '';
      const words = speech.toLowerCase().match(/\b\w{3,}\b/g) || [];
      for (const w of words) {
        if (!this.stop_words.has(w)) {
          this.historical_keywords.add(w);
        }
      }
    }
  }

  /**
   * Scan competitor final speech, check for the injection of new terms, and trigger alerts.
   * @param {string} competitorId - Target competitor identifier.
   * @param {string} closingSpeechText - Closing summary speech text block.
   * @returns {Object} Verdict report on new assertions and terms.
   */
  auditClosingSpeech(competitorId, closingSpeechText) {
    const closingWords = closingSpeechText.toLowerCase().match(/\b\w{3,}\b/g) || [];
    const closingKeys = new Set();
    for (const w of closingWords) {
      if (!this.stop_words.has(w)) {
        closingKeys.add(w);
      }
    }

    // Check for absolute new vocabulary insertions (difference: closingKeys - historical_keywords)
    const newInjections = [];
    for (const key of closingKeys) {
      if (!this.historical_keywords.has(key)) {
        newInjections.push(key);
      }
    }

    const isViolating = newInjections.length > 3; // Safe tolerance index for dynamic phrases
    let report = 'Closing speech contains no new logical assertions.';

    if (isViolating) {
      report = `[REFEREE RULES INFRACTION]: Competitor '${competitorId}' injected new arguments at closing! Flagged new terms: [${newInjections
        .slice(0, 5)
        .map(x => `'${x}'`)
        .join(', ')}]`;
    }

    return {
      competitor_id: competitorId,
      has_new_arguments: isViolating,
      new_terms_spotted: newInjections,
      total_new_terms: newInjections.length,
      audit_verdict_report: report
    };
  }
}

module.exports = ClosingSummaryAuditorJudge;
