/**
 * Rhetorical Storytelling Skill Module.
 * Adheres strictly to dynamic stance rhetoric and Section 3.2 constraints.
 */

class RhetoricalStorytellingDebator {
  /**
   * Initialize with active debate stance.
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
    this.templates = {
      affirmative: {
        analogy: 'like a seed growing into a grand oak tree',
        hook: 'Imagine a world where innovation automates tedious labor...',
        impact: 'This represents a positive leap forward in human welfare.'
      },
      negative: {
        analogy: 'like a house of cards ready to collapse',
        hook: 'Consider the unforeseen systemic side-effects of rapid automation...',
        impact: 'This risks a critical failure cascade, threatening overall stability.'
      }
    };
  }

  /**
   * Apply rhetorical analogies and narrative overlays to the text draft.
   * @param {string} textDraft - Raw statement draft.
   * @returns {Object} Narrative overlaid statement payload.
   */
  execute(textDraft) {
    const activeRules = this.templates[this.stance];
    
    // Structure the speech locally with rhetorical overlays
    let narrative = `${activeRules.hook}\n\n`;
    narrative += `${textDraft} (It is ${activeRules.analogy}).\n\n`;
    narrative += `Ultimately, ${activeRules.impact}`;

    return {
      stance: this.stance,
      original_draft_length: textDraft.length,
      rhetorical_speech: narrative,
      has_rhetoric_hook: true
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

module.exports = RhetoricalStorytellingDebator;
