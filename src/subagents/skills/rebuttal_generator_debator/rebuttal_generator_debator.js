/**
 * Rebuttal Generator Skill Module.
 * Adheres strictly to adversarial logic clash, evidence auditing, and Section 3.2 constraints.
 */

class RebuttalGeneratorDebator {
  /**
   * Initialize the rebuttal generator targeting active debate stances.
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
   * Examine competitor's claims, audit citation strengths, and construct targeted clashes.
   * @param {Array<string>} opponentClaims - List of core claims made by the opponent.
   * @param {number} opponentCitationsCount - Count of citations provided in opponent's turn payload.
   * @returns {Object} Target rebuttals payload conforming to PRD specifications.
   */
  generateRebuttals(opponentClaims, opponentCitationsCount) {
    const rebuttals = [];
    let clashPointsCount = 0;

    // Enforce strategic citation auditing (Section 8.3 point 5)
    if (opponentCitationsCount === 0) {
      rebuttals.push(
        "The competitor's constructs are completely unbacked, failing to supply a single verified empirical citation."
      );
      clashPointsCount += 1;
    }

    for (const claim of opponentClaims) {
      let counter = '';
      // Stance-aware dynamic clash generation logic
      if (this.stance === 'negative') {
        // Con agent attacks affirmative structural feasibility
        counter = `Regarding the assertion '${claim}': the competitor incorrectly prioritizes automation, neglecting critical cascading vulnerabilities.`;
      } else if (this.stance === 'affirmative') {
        // Pro agent defends constructive pillars against counter-attacks
        counter = `In defense against the counter-claim '${claim}': the negative concern is a managed variable, vastly outweighed by ultimate constructive impacts.`;
      }
      rebuttals.push(counter);
      clashPointsCount += 1;
    }

    const rebuttalReport = `Targeted clashes successfully generated for ${clashPointsCount} points of clash.`;

    return {
      stance: this.stance,
      incoming_clashes_count: opponentClaims.length,
      generated_rebuttals: rebuttals,
      total_clash_points: clashPointsCount,
      rebuttal_report: rebuttalReport
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

module.exports = RebuttalGeneratorDebator;
