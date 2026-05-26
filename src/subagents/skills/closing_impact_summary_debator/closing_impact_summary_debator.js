/**
 * Closing Impact Summary Skill Module.
 * Adheres strictly to closing round rules, impact weighting, and Section 3.2 constraints.
 */

class ClosingImpactSummaryDebator {
  /**
   * Initialize the closing compiler with target debate stance.
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
   * Construct the standardized closing argument mapping final key points of clash.
   * @param {Array<string>} primaryWins - List of established decisive outcomes.
   * @param {Array<string>} competitorLeaks - List of unresolved competitor errors.
   * @returns {Object} Final closing statement payload.
   * @throws {ValueError} If primaryWins is empty.
   */
  compileFinalClosingSpeech(primaryWins, competitorLeaks) {
    if (!primaryWins || primaryWins.length === 0) {
      throw new ValueError("Closing speech construction requires a list of constructive 'primary_wins'");
    }

    // Stance-aware structural impact weighting rules (Section 8.3 point 2)
    const speechTitle = this.stance === 'affirmative' ? 'FINAL CONSTRUCTIVE SUMMARY' : 'FINAL PRECAUTIONARY ADVOCACY';
    const primaryWinWeight = this.stance === 'affirmative' ? 'overriding net welfare benefits' : 'precautionary risk mitigation';
    const capitalizedStance = this.stance.charAt(0).toUpperCase() + this.stance.slice(1);

    let markdownSpeech = `### 🏆 ${speechTitle} (Stance: ${capitalizedStance})\n\n`;
    markdownSpeech += `Honorable Referee, as this critical debate concludes, the case must be decided on **${primaryWinWeight}**.\n\n`;

    markdownSpeech += '**🔑 Primary Decisive Outcomes Established**:\n';
    for (const win of primaryWins) {
      markdownSpeech += `- We have successfully demonstrated: ${win}\n`;
    }
    markdownSpeech += '\n';

    markdownSpeech += '**⚠️ Critical Failures of the Opponent**:\n';
    for (const leak of competitorLeaks) {
      markdownSpeech += `- The competitor has failed to resolve: ${leak}\n`;
    }
    markdownSpeech += '\n';

    markdownSpeech += `Consequently, the **${capitalizedStance}** stance is the only logically verified conclusion.`;

    const closingReport = `Closing speech successfully compiled for active stance: ${this.stance}.`;

    return {
      stance: this.stance,
      closing_markdown: markdownSpeech,
      clash_voter_points_count: primaryWins.length + competitorLeaks.length,
      closing_report: closingReport
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

module.exports = ClosingImpactSummaryDebator;
