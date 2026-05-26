/**
 * Time Allocation Strategy Skill Module.
 * Adheres strictly to turn pacing strategy, word count optimizations, and Section 3.2 constraints.
 */

class TimeAllocationStrategyDebator {
  /**
   * Initialize the strategic pacer with active stance.
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
   * Audit the active round ID and compile structural pacing parameters and focus targets.
   * @param {number} currentRound - Active round ID.
   * @param {number} [totalRounds=10] - Total round limit for the session.
   * @returns {Object} Tactical strategy and word bounds payload.
   * @throws {ValueError} If currentRound is invalid.
   */
  calculateStrategyBounds(currentRound, totalRounds = 10) {
    if (currentRound <= 0 || currentRound > totalRounds) {
      throw new ValueError(`Round must be between 1 and ${totalRounds}`);
    }

    let wordCountCap = 500;
    let tacticalFocus = '';

    // Stance-aware dynamic pacing logic (Section 8.3 point 3)
    if (this.stance === 'affirmative') {
      // Pro: Scale early, defend late
      if (currentRound <= 5) {
        // Early rounds: Maximize constructive footprint
        wordCountCap = 800;
        tacticalFocus = 'PRO ACTIVE BUILD: Construct primary logical pillars and deploy empirical statistics.';
      } else {
        // Late rounds: Protect and weight impacts
        wordCountCap = 400;
        tacticalFocus = 'PRO DEFENSE WEIGHTING: Scale final welfare impacts and mitigate negative counterarguments.';
      }
    } else if (this.stance === 'negative') {
      // Con: Recon early, saturate late
      if (currentRound <= 5) {
        // Early rounds: Conserve context token budget
        wordCountCap = 300;
        tacticalFocus = 'CON INTERROGATION: Present targeted, brief queries targeting structural boundaries.';
      } else {
        // Late rounds: Launch exhaustive coverage clash
        wordCountCap = 700;
        tacticalFocus = 'CON SATURATION ATTACK: Unleash comprehensive logical clash to exhaust positive defenses.';
      }
    }

    const strategyReport = `Pacing locked for round ${currentRound}/${totalRounds}. Word count cap: ${wordCountCap}.`;

    return {
      stance: this.stance,
      current_round: currentRound,
      total_rounds: totalRounds,
      word_count_cap: wordCountCap,
      tactical_focus: tacticalFocus,
      strategy_report: strategyReport
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

module.exports = TimeAllocationStrategyDebator;
