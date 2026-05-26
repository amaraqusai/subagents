/**
 * Tie-Breaker Resolution Judge Skill Module.
 * Adheres strictly to draw prevention, multi-vector float differentiation, and Section 3.2.
 */

class TieBreakerResolutionJudge {
  /**
   * Initialize with default tie-breaker priority configurations.
   */
  constructor() {
    /** @type {number} */
    this.fact_ratio_boost = 0.005;
    /** @type {number} */
    this.clash_index_boost = 0.003;
    /** @type {number} */
    this.fallacy_penalty_boost = 0.002;
    /** @type {number} */
    this.default_stance_boost = 0.001;
  }

  /**
   * Helper utility to apply a tie-breaker boost to target stance safely within 0-100 score constraints.
   * @param {string} targetStance - 'pro' or 'con'.
   * @param {number} boostVal - Value of the boost to apply.
   * @param {number} proVal - Current score of pro.
   * @param {number} conVal - Current score of con.
   * @returns {Array<number>} Safe [newPro, newCon] scores.
   * @private
   */
  _applyBoost(targetStance, boostVal, proVal, conVal) {
    let nextPro = proVal;
    let nextCon = conVal;

    if (targetStance === 'pro') {
      if (proVal + boostVal <= 100.0) {
        nextPro = proVal + boostVal;
      } else {
        nextCon = Math.max(conVal - boostVal, 0.0);
      }
    } else {
      if (conVal + boostVal <= 100.0) {
        nextCon = conVal + boostVal;
      } else {
        nextPro = Math.max(proVal - boostVal, 0.0);
      }
    }
    return [nextPro, nextCon];
  }

  /**
   * Evaluate raw score outputs, detect draw states, and apply priority sub-metrics to force a decisive victory.
   * @param {Object} input - Tie-breaker metrics input.
   * @param {number} input.pro_score - Raw score for pro_agent.
   * @param {number} input.con_score - Raw score for con_agent.
   * @param {number} input.pro_fact_ratio - Citation verification ratio (0.0 to 1.0) for pro_agent.
   * @param {number} input.con_fact_ratio - Citation verification ratio (0.0 to 1.0) for con_agent.
   * @param {number} input.pro_clash_index - Direct responsiveness overlap index (0.0 to 1.0) for pro_agent.
   * @param {number} input.con_clash_index - Direct responsiveness overlap index (0.0 to 1.0) for con_agent.
   * @param {number} input.pro_fallacies_count - Logical fallacy infraction occurrences for pro_agent.
   * @param {number} input.con_fallacies_count - Logical fallacy infraction occurrences for con_agent.
   * @returns {Object} Tie-breaker scorecard resolution payload.
   */
  resolveTie(input) {
    const {
      pro_score,
      con_score,
      pro_fact_ratio,
      con_fact_ratio,
      pro_clash_index,
      con_clash_index,
      pro_fallacies_count,
      con_fallacies_count
    } = input;

    let finalPro = parseFloat(pro_score.toFixed(3));
    let finalCon = parseFloat(con_score.toFixed(3));
    let tieBroken = false;
    let appliedBreaker = 'none';
    let justification = '';

    if (finalPro !== finalCon) {
      const winner = finalPro > finalCon ? 'pro_agent' : 'con_agent';
      const margin = Math.abs(finalPro - finalCon);
      justification = `Natural winner determined by score discrepancy. Winner: '${winner}' with a margin of ${margin.toFixed(3)} points.`;
      return {
        winner_id: winner,
        final_pro_score: finalPro,
        final_con_score: finalCon,
        tie_broken: false,
        tie_breaker_applied: appliedBreaker,
        margin_differential: parseFloat(margin.toFixed(3)),
        justification: justification
      };
    }

    tieBroken = true;

    // Tie state exists! Apply multi-vector float differentiation priority checks.
    if (pro_fact_ratio !== con_fact_ratio) {
      appliedBreaker = 'citation_verification_index';
      if (pro_fact_ratio > con_fact_ratio) {
        [finalPro, finalCon] = this._applyBoost('pro', this.fact_ratio_boost, finalPro, finalCon);
        justification = `Tie broken using primary metric: Citation Verification Index. Pro stance has superior factual verity (${pro_fact_ratio.toFixed(3)} vs ${con_fact_ratio.toFixed(3)}).`;
      } else {
        [finalPro, finalCon] = this._applyBoost('con', this.fact_ratio_boost, finalPro, finalCon);
        justification = `Tie broken using primary metric: Citation Verification Index. Con stance has superior factual verity (${con_fact_ratio.toFixed(3)} vs ${pro_fact_ratio.toFixed(3)}).`;
      }
    } else if (pro_clash_index !== con_clash_index) {
      appliedBreaker = 'direct_clash_index';
      if (pro_clash_index > con_clash_index) {
        [finalPro, finalCon] = this._applyBoost('pro', this.clash_index_boost, finalPro, finalCon);
        justification = `Tie broken using secondary metric: Direct Clash Index. Pro stance has superior responsiveness overlap (${pro_clash_index.toFixed(3)} vs ${con_clash_index.toFixed(3)}).`;
      } else {
        [finalPro, finalCon] = this._applyBoost('con', this.clash_index_boost, finalPro, finalCon);
        justification = `Tie broken using secondary metric: Direct Clash Index. Con stance has superior responsiveness overlap (${con_clash_index.toFixed(3)} vs ${pro_clash_index.toFixed(3)}).`;
      }
    } else if (pro_fallacies_count !== con_fallacies_count) {
      appliedBreaker = 'fallacy_penalty_count';
      if (pro_fallacies_count < con_fallacies_count) {
        [finalPro, finalCon] = this._applyBoost('pro', this.fallacy_penalty_boost, finalPro, finalCon);
        justification = `Tie broken using tertiary metric: Fallacy Infraction Count. Pro stance has fewer logical gaps (${pro_fallacies_count} vs ${con_fallacies_count}).`;
      } else {
        [finalPro, finalCon] = this._applyBoost('con', this.fallacy_penalty_boost, finalPro, finalCon);
        justification = `Tie broken using tertiary metric: Fallacy Infraction Count. Con stance has fewer logical gaps (${con_fallacies_count} vs ${pro_fallacies_count}).`;
      }
    } else {
      appliedBreaker = 'stance_precedence_fallback';
      [finalPro, finalCon] = this._applyBoost('pro', this.default_stance_boost, finalPro, finalCon);
      justification = `Absolute statistical parity reached across all performance indices. Tie broken decisively by awarding opening speaker stance precedence to Affirmative Pro stance.`;
    }

    const margin = Math.abs(finalPro - finalCon);
    const winner = finalPro > finalCon ? 'pro_agent' : 'con_agent';

    return {
      winner_id: winner,
      final_pro_score: parseFloat(finalPro.toFixed(3)),
      final_con_score: parseFloat(finalCon.toFixed(3)),
      tie_broken: tieBroken,
      tie_breaker_applied: appliedBreaker,
      margin_differential: parseFloat(margin.toFixed(3)),
      justification: justification
    };
  }
}

module.exports = TieBreakerResolutionJudge;
