/**
 * Cross-Examination Trigger Judge Skill Module.
 * Adheres strictly to turn interruption controllers, Socratic sub-phases, and Section 3.2 constraints.
 */

class CrossExaminationTriggerJudge {
  /**
   * Initialize with targeted custom controversy keys (mapping to Section 8.2 boundaries).
   * @param {Array<string>} [targetControversialTokens=null] - List of custom controversy keywords.
   */
  constructor(targetControversialTokens = null) {
    /** @type {Array<string>} */
    this.targetTokens = targetControversialTokens || [
      'absolute proof',
      'impossible to disprove',
      'liar',
      '100% false'
    ];
    /** @type {number} */
    this.total_interruption_triggers = 0;
  }

  /**
   * Audit active competitor speech, locate alerts match, and return cross-exam trigger structures.
   * @param {string} speechText - The active competitor turn markdown speech body.
   * @returns {Object} Interruption evaluation and trigger result structures.
   */
  evaluateTurnInterruption(speechText) {
    const speechLower = speechText.toLowerCase();
    let matchedAlertToken = '';
    let isTriggerActivated = false;

    for (const token of this.targetTokens) {
      if (speechLower.includes(token)) {
        isTriggerActivated = true;
        matchedAlertToken = token;
        this.total_interruption_triggers += 1;
        break;
      }
    }

    let interruptionPrompt = '';
    let tacticalTarget = 'Dialogue loop continues under standard alternating turns.';

    if (isTriggerActivated) {
      interruptionPrompt = `SYSTEM EXAM INTERRUPT: Competitor asserted: '${matchedAlertToken}'. Standard turn transitions are paused. Clarify this extreme claim immediately.`;
      tacticalTarget = 'Cross-examination active: pausing active turn queue for 1-ping clarification.';
    }

    const auditReport = `Cross-examination trigger audit completed. Total triggers log: ${this.total_interruption_triggers}.`;

    return {
      is_trigger_activated: isTriggerActivated,
      matched_alert_token: matchedAlertToken,
      interruption_prompt: interruptionPrompt,
      tactical_target: tacticalTarget,
      audit_report: auditReport
    };
  }
}

module.exports = CrossExaminationTriggerJudge;
