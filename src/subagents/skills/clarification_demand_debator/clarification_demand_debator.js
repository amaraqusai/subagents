/**
 * Clarification Demand Skill Module.
 * Adheres strictly to linguistic ambiguity interrogation and Section 3.2 constraints.
 */

class ClarificationDemandDebator {
  /**
   * Initialize the clarifier with active debate stance.
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
    this.demandMaps = {
      affirmative: {
        ambiguity_key: 'risk',
        question: "Could the competitor specify the exact metric boundary where their defensive 'systemic risk' escalates into a catastrophic loop?",
        target_objective: 'Force opponent to quantify vague cost/risk bounds to expose defensive retreat.'
      },
      negative: {
        ambiguity_key: 'efficiency',
        question: "Could the competitor specify the precise baseline metrics of their constructive 'efficiency', mapping how it absorbs backend cascade cascades?",
        target_objective: 'Expose shifting goalposts and abstract affirmative definitions.'
      }
    };
  }

  /**
   * Inspect competitor's statements for vague concepts and compile a targeted definition query.
   * @param {string} competitorStatement - The raw statement block of the competitor.
   * @returns {Object} Ambiguity check and definition query payload.
   */
  compileClarificationDemand(competitorStatement) {
    const stanceRules = this.demandMaps[this.stance];
    const targetToken = stanceRules.ambiguity_key;
    let hasTargetMatched = false;
    let demandQuery = '';
    let objectiveLog = '';

    if (competitorStatement.toLowerCase().includes(targetToken)) {
      hasTargetMatched = true;
      demandQuery = stanceRules.question;
      objectiveLog = stanceRules.target_objective;
    } else {
      // Dynamic fallback general empirical source inquiry (Section 8.3 point 5)
      const truncatedRef = competitorStatement.substring(0, 60).trim() + '...';
      demandQuery = `Could the competitor define the exact empirical metrics and verify citation backings for: '${truncatedRef}'?`;
      objectiveLog = 'General empirical source integrity challenge.';
    }

    const demandReport = `Clarification definition demand compiled under ${this.stance} strategy.`;

    return {
      stance: this.stance,
      target_key: targetToken,
      has_target_matched: hasTargetMatched,
      demand_query: demandQuery,
      tactical_objective: objectiveLog,
      demand_report: demandReport
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

module.exports = ClarificationDemandDebator;
