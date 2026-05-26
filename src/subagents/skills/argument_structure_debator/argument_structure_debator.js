/**
 * Argument Structuring Skill Module.
 * Adheres strictly to standard debate structuring layouts and Section 3.2 constraints.
 */

class ArgumentStructureDebator {
  /**
   * Initialize the compiler with target debate stance.
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
   * Apply dynamic markdown debate templates (Constructive affirmative vs counter-claim negative).
   * @private
   * @param {string} claim - Central argument claim.
   * @param {Array<string>} premises - Foundational logical claims.
   * @param {Array<string>} evidence - Verified empirical data points.
   * @param {Array<string>} impacts - Ultimate strategic impacts.
   * @returns {string} Fully compiled Markdown speech string.
   */
  _compileMarkdownSpeech(claim, premises, evidence, impacts) {
    const header = this.stance === 'affirmative' ? 'Constructive Pillar' : 'Defensive Counter-Wedge';
    
    let markdown = `### 🎭 ${header} (Stance: ${this.stance.charAt(0).toUpperCase() + this.stance.slice(1)})\n\n`;
    markdown += `**🎯 Central Claim**: ${claim}\n\n`;
    
    markdown += '**💡 Logical Premises (Foundational Claims)**:\n';
    for (const p of premises) {
      markdown += `- ${p}\n`;
    }
    markdown += '\n';
    
    markdown += '**📊 Empirical Evidence (Verified Data Points)**:\n';
    for (const e of evidence) {
      markdown += `- ${e}\n`;
    }
    markdown += '\n';
    
    markdown += '**💥 Strategic Impacts (Ultimate Weight)**:\n';
    for (const i of impacts) {
      markdown += `- ${i}\n`;
    }
        
    return markdown;
  }

  /**
   * Validate input payload parameters and generate the standardized speech output block.
   * @param {Object} payload - The input data structure containing debate points.
   * @param {string} payload.claim - The central claim.
   * @param {Array<string>} payload.premises - List of foundational premises.
   * @param {Array<string>} [payload.evidence] - Optional list of supporting evidence.
   * @param {Array<string>} [payload.impacts] - Optional list of strategic impacts.
   * @returns {Object} Compiled Speech payload conforming to PRD OutputSchema.
   * @throws {ValueError} If required parameters claim or premises are missing.
   */
  execute(payload) {
    const claim = payload.claim || '';
    const premises = payload.premises || [];
    const evidence = payload.evidence || [];
    const impacts = payload.impacts || [];

    if (!claim) {
      throw new ValueError("Argument construction requires a central 'claim'");
    }
    if (!premises || premises.length === 0) {
      throw new ValueError("Argument construction requires a list of logical 'premises'");
    }

    const formattedMarkdown = this._compileMarkdownSpeech(claim, premises, evidence, impacts);

    return {
      stance: this.stance,
      claim_extracted: claim,
      speech_markdown: formattedMarkdown,
      structural_nodes_count: premises.length + evidence.length + impacts.length
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

module.exports = ArgumentStructureDebator;
