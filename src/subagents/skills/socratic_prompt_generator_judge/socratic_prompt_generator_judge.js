/**
 * Socratic Prompt Generator Judge Skill Module.
 * Adheres strictly to Socratic questioning, context-aware prompts, and Section 3.2 constraints.
 */

class SocraticPromptGeneratorJudge {
  /**
   * Initialize the Socratic compiler under the target debate subject topic.
   * @param {string} debateSubject - The topic subject being debated.
   */
  constructor(debateSubject) {
    /** @type {string} */
    this.debate_subject = debateSubject;

    // Define targeted Socratic challenge prompt lists mapping to roles (Section 8.3 point 2)
    /** @type {Object} */
    this.socratic_questions_bank = {
      pro: [
        'How does the constructive model justify rapid scaling when confronted with high initial overhead integration costs?',
        'What is the ultimate empirical foundation establishing that net affirmative benefits outweigh potential risk cascades?'
      ],
      con: [
        'If defensive risk parameters are manageable variables, why does the opposing model predict total systemic collapse?',
        'Does the defensive opposition model propose a concrete alternative construct, or solely outline systemic vulnerabilities?'
      ]
    };
  }

  /**
   * Compile a custom Socratic challenge prompt mapping active round and target stance.
   * @param {string} targetCompetitorId - Stance id under challenge ('pro' or 'con').
   * @param {number} activeRoundId - Current running debate round index.
   * @returns {Object} Socratic question payload structures.
   * @throws {ValueError} If targetCompetitorId is not 'pro' or 'con'.
   */
  compileTargetedSocraticChallenge(targetCompetitorId, activeRoundId) {
    if (targetCompetitorId !== 'pro' && targetCompetitorId !== 'con') {
      throw new ValueError("Target competitor ID must be 'pro' or 'con'.");
    }

    const questionList = this.socratic_questions_bank[targetCompetitorId];

    // Select prompt dynamically based on debate round phase milestones
    const questionIndex = activeRoundId <= 5 ? 0 : 1;
    const selectedQuestion = questionList[questionIndex];

    const compiledPrompt = `REFEREE SOCRATIC CHALLENGE (Round ${activeRoundId}): Regarding the debate subject '${this.debate_subject}', address the following structural clash: '${selectedQuestion}'`;

    const objectiveLog = `Socratic question generated successfully for ${targetCompetitorId.toUpperCase()} subagent.`;

    return {
      target_competitor: targetCompetitorId,
      debate_subject: this.debate_subject,
      socratic_question: selectedQuestion,
      compiled_socratic_prompt: compiledPrompt,
      objective_log: objectiveLog
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

module.exports = SocraticPromptGeneratorJudge;
