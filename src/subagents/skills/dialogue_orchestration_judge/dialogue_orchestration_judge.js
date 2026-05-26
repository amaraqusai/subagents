/**
 * Dialogue Orchestration Judge Skill Module.
 * Adheres strictly to Turn routing sequence boundaries, JSON protocols, and Section 3.2.
 */

class DialogueOrchestrationJudge {
  /**
   * Initialize the orchestrator loop state with subject and configured rounds cap.
   * @param {string} subject - Debate subject topic.
   * @param {number} [totalRoundsLimit=10] - Absolute round limit for standard sequence.
   */
  constructor(subject, totalRoundsLimit = 10) {
    /** @type {string} */
    this.subject = subject;
    /** @type {number} */
    this.totalRoundsLimit = totalRoundsLimit;
    /** @type {number} */
    this.current_round = 1;
    /** @type {Array<Object>} */
    this.debate_history_log = [];
  }

  /**
   * Execute target competitor turn, packaging opponent payload into secure routing contract.
   * @param {string} senderId - ID of the competitor transmitting payload ('pro' or 'con').
   * @param {string} receiverId - ID of the competitor receiving payload.
   * @param {Function} competitorCallback - Call back function to invoke competitor turn.
   * @param {Object} incomingPayload - Preceding competitor turn output.
   * @returns {Object} Output payload from the executed competitor turn callback.
   */
  routeTransactionTurn(senderId, receiverId, competitorCallback, incomingPayload) {
    const opponentSpeech = incomingPayload.speech_markdown || 'Proceed with opening constructive argument.';
    const opponentCitations = incomingPayload.sources || [];
    const opponentVerityIndex = incomingPayload.truthfulness_index !== undefined ? incomingPayload.truthfulness_index : 1.0;

    // Build structural routing payload conforming to TurnRoutingSchema
    const routingEnvelope = {
      session_id: `round_seq_${this.current_round}`,
      active_round: this.current_round,
      debate_subject: this.subject,
      target_opponent_speech: opponentSpeech,
      opponent_source_citations: opponentCitations,
      opponent_truthfulness_index: opponentVerityIndex,
      turn_count_remaining: this.totalRoundsLimit - this.current_round
    };

    // Invoke competitor callback subprocess
    const startTime = Date.now();
    const competitorOutput = competitorCallback(routingEnvelope);
    const executionLatency = (Date.now() - startTime) / 1000.0;

    // Append structured turn entries to history logs
    const turnEntry = {
      round_id: this.current_round,
      speaker_id: senderId,
      receiver_id: receiverId,
      speech_text: competitorOutput.speech_markdown || '',
      source_citations: competitorOutput.evidence_citations || [],
      latency_seconds: parseFloat(executionLatency.toFixed(3))
    };
    this.debate_history_log.push(turnEntry);

    return competitorOutput;
  }

  /**
   * Increment state machine round counter.
   */
  advanceDebateRound() {
    this.current_round += 1;
  }

  /**
   * Evaluate if debate turn constraints have been reached.
   * @returns {boolean} True if round exceeds total limit.
   */
  checkDebateCompletion() {
    return this.current_round > this.totalRoundsLimit;
  }
}

module.exports = DialogueOrchestrationJudge;
