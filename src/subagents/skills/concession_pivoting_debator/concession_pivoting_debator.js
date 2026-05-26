/**
 * Concession Pivoting Skill Module.
 * Adheres strictly to dynamic concession transitions, rhetorical pivots, and Section 3.2 constraints.
 */

class ConcessionPivotingDebator {
  /**
   * Initialize the pivot engine with active stance.
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
    this.pivotMaps = {
      affirmative: {
        concession: 'the initial configuration demands integration overhead',
        pivot_linker: 'however, this setup investment is the precise mechanism enabling',
        core_argument: 'long-term performance scaling and absolute token efficiency.'
      },
      negative: {
        concession: 'the affirmative frontend offers minor usability benefits',
        pivot_linker: 'nonetheless, this superficial construct is structurally irrelevant when weighed against',
        core_argument: 'the underlying backend single-point-of-failure vulnerabilities threatening complete system collapse.'
      }
    };
  }

  /**
   * Gracefully concede secondary opponent claims and construct a targeted pivot link.
   * @param {string} attackClaim - The specific attack statement/claim to pivot.
   * @returns {Object} Concession pivot statement payload.
   */
  compileConcessionPivot(attackClaim) {
    const stanceRules = this.pivotMaps[this.stance];

    // Build the structured concession speech block
    const pivotSpeech = `While we gracefully acknowledge that ${stanceRules.concession}, ${stanceRules.pivot_linker} ${stanceRules.core_argument}`;
    const pivotReport = `Graceful concession pivot successfully generated for: ${this.stance}.`;

    return {
      stance: this.stance,
      incoming_attack_ref: attackClaim,
      conceded_element: stanceRules.concession,
      pivot_speech: pivotSpeech,
      pivoted_target: stanceRules.core_argument,
      pivot_report: pivotReport
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

module.exports = ConcessionPivotingDebator;
