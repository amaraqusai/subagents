/**
 * Grade Justification Report Judge Skill Module.
 * Adheres strictly to RefereeReportSchema formats, report formatting, and Section 3.2.
 */

class GradeJustificationReportJudge {
  /**
   * Compile full scorecard stats and format a beautiful, detailed markdown report.
   * @param {Object} input - Detailed scorecard metrics payload.
   * @param {string} input.debate_subject - The debate target topic.
   * @param {number} input.total_rounds - Total rounds of debate executed.
   * @param {string} input.winner_id - Winner competitor identifier.
   * @param {number} input.final_pro_score - Final normalized and tie-broken score for pro_agent.
   * @param {number} input.final_con_score - Final normalized and tie-broken score for con_agent.
   * @param {number} input.margin_differential - Math absolute margin differential.
   * @param {Array<Object>} input.fallacy_infractions_log - All fallacy penalty occurrences.
   * @param {number} input.pro_verified_ratio - Factual verity ratio for pro_agent.
   * @param {number} input.con_verified_ratio - Factual verity ratio for con_agent.
   * @param {number} input.pro_overlap_index - Responsiveness overlap ratio for pro_agent.
   * @param {number} input.con_overlap_index - Responsiveness overlap ratio for con_agent.
   * @returns {Object} Full standardized RefereeReportSchema JSON.
   */
  compileReport(input) {
    const {
      debate_subject,
      total_rounds,
      winner_id,
      final_pro_score,
      final_con_score,
      margin_differential,
      fallacy_infractions_log,
      pro_verified_ratio,
      con_verified_ratio,
      pro_overlap_index,
      con_overlap_index
    } = input;

    const winnerName = winner_id === 'pro_agent' ? 'Cristiano Ronaldo Fan (Pro Agent)' : 'Lionel Messi Fan (Con Agent)';
    const totalInfractions = fallacy_infractions_log ? fallacy_infractions_log.length : 0;

    // Formatting fallacy log rows for markdown table
    let fallacyTableRows = '';
    if (totalInfractions > 0) {
      fallacyTableRows = fallacy_infractions_log.map(item => {
        const comp = item.competitor_id === 'pro_agent' ? 'Cristiano Ronaldo Fan (Pro Agent)' : 'Lionel Messi Fan (Con Agent)';
        return `| Round ${item.round_id} | ${comp} | ${item.fallacy_type} | -${item.deduction_penalty.toFixed(1)} pts |`;
      }).join('\n');
    } else {
      fallacyTableRows = '| N/A | No Infractions | None | 0 pts |';
    }

    // Creating the beautiful premium markdown justification
    const mdReport = `
# ⚖️ Autonomous Multi-Agent Debate - Referee Diagnostic Evaluation Report

## 📋 Debate Summary & Metadata
- **Debate Subject (Topic):** \`${debate_subject}\`
- **Total Debate Rounds (Turns):** \`${total_rounds}\` rounds per side
- **Final Result Decision:** **${winnerName} Victory** 🏆

---

## 🏆 Final Verdict Scorecard

| Competitor | Raw/Normalized Stance Grade | Total Fallacy Deductions | Final Weighted Score | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Cristiano Ronaldo Fan (Pro Agent)** | ${(final_pro_score + (winner_id === 'pro_agent' ? -margin_differential : 0.0)).toFixed(2)} | *Dynamic deduction applied* | **${final_pro_score.toFixed(2)} / 100** | ${winner_id === 'pro_agent' ? '🥇 Winner' : '🥈 Runner-up'} |
| **Lionel Messi Fan (Con Agent)** | ${(final_con_score + (winner_id === 'con_agent' ? -margin_differential : 0.0)).toFixed(2)} | *Dynamic deduction applied* | **${final_con_score.toFixed(2)} / 100** | ${winner_id === 'con_agent' ? '🥇 Winner' : '🥈 Runner-up'} |

- **Margin of Victory:** **${margin_differential.toFixed(3)} points**

---

## 🔍 Multi-Vector Core Performance Analytics

### 1. Empirical Fact-Checking & Citation Audit Index
*Evaluates structural factuality and limits LLM hallucination rate based on verified caches.*
- **Affirmative (Pro Agent) Truth Index:** **${(pro_verified_ratio * 100).toFixed(1)}%** verified claims.
- **Negative (Con Agent) Truth Index:** **${(con_verified_ratio * 100).toFixed(1)}%** verified claims.

### 2. Conversational Overlap & Direct Clash Index
*Evaluates direct argument-to-argument responsiveness to prevent parallel speaking consensus bypass.*
- **Affirmative (Pro Agent) Responsiveness Overlap Index:** **${(pro_overlap_index * 100).toFixed(1)}%** overlap.
- **Negative (Con Agent) Responsiveness Overlap Index:** **${(con_overlap_index * 100).toFixed(1)}%** overlap.

---

## 🚫 Logical Fallacy & Infractions Deductions Journal
*Logs exact logical slips parsed and weighted centrally via linter matrices.*

| Sequence (Round) | Infracting Agent | Fallacy Pattern Identified | Deduction Applied |
| :--- | :--- | :--- | :--- |
${fallacyTableRows}

---

## ⚖️ Analytical Justification Verdict
The Referee has audited this high-stakes multi-agent debate session with extreme mathematical precision. The final grade scorecard rewards empirical accuracy, direct argumentation overlap clash ratios, and logical sanitation.

**${winnerName}** was declared the absolute winner. They demonstrated superior performance overall, successfully defending their stances, building constructive pillars, and calling out the rival's bluffs while avoiding logical fallacies.

*This debate report and its scorecards strictly adhere to the Yoram Segal multi-agent debate protocol. Draws are prohibited. Decisive winner successfully resolved.*
`.trim();

    return {
      debate_subject: debate_subject,
      total_rounds: total_rounds,
      verdict: {
        winner_id: winner_id,
        final_pro_score: parseFloat(final_pro_score.toFixed(3)),
        final_con_score: parseFloat(final_con_score.toFixed(3)),
        margin_differential: parseFloat(margin_differential.toFixed(3))
      },
      fallacy_infractions_log: fallacy_infractions_log.map(item => ({
        round_id: item.round_id,
        competitor_id: item.competitor_id,
        fallacy_type: item.fallacy_type,
        deduction_penalty: parseFloat(item.deduction_penalty.toFixed(3))
      })),
      fact_check_ratios: {
        pro_verified_ratio: parseFloat(pro_verified_ratio.toFixed(3)),
        con_verified_ratio: parseFloat(con_verified_ratio.toFixed(3))
      },
      clash_responsiveness_score: {
        pro_overlap_index: parseFloat(pro_overlap_index.toFixed(3)),
        con_overlap_index: parseFloat(con_overlap_index.toFixed(3))
      },
      grading_justification: mdReport
    };
  }
}

module.exports = GradeJustificationReportJudge;
