/**
 * Stance-Aware Internet Search Skill Module.
 * Adheres strictly to Exercise 02 (Mandatory search tool) and Section 3.2 constraints.
 */

class InternetSearchDebator {
  /**
   * Initialize with stance polarity validation.
   * @param {string} stance - The target debate stance ('affirmative' or 'negative').
   * @throws {TypeError|RangeError} If stance is not 'affirmative' or 'negative'.
   */
  constructor(stance) {
    if (stance !== 'affirmative' && stance !== 'negative') {
      throw new ValueError("Stance must be 'affirmative' or 'negative'");
    }
    /** @type {string} */
    this.stance = stance;
  }

  /**
   * Parse raw query results to extract stance-supporting arguments (Affirmative vs Negative).
   * @private
   * @param {Array<Object>} dataset - The raw query results.
   * @returns {Array<Object>} The filtered results.
   */
  _filterStanceData(dataset) {
    const filtered = [];
    for (const item of dataset) {
      const tags = item.tags || [];
      if (this.stance === 'affirmative' && tags.includes('pro')) {
        filtered.push(item);
      } else if (this.stance === 'negative' && tags.includes('con')) {
        filtered.push(item);
      }
    }
    return filtered;
  }

  /**
   * Execute a text-match search against mock database cache and apply stance filters.
   * @param {string} query - The search term.
   * @param {Array<Object>} searchCache - The dataset cache to search.
   * @returns {Object} The search execution result payload.
   */
  executeSearch(query, searchCache) {
    const matches = [];
    const queryLower = query.toLowerCase();

    for (const doc of searchCache) {
      if ((doc.content || '').toLowerCase().includes(queryLower)) {
        matches.push(doc);
      }
    }

    const findings = this._filterStanceData(matches);

    return {
      query: query,
      stance: this.stance,
      total_raw_matches: matches.length,
      filtered_matches_count: findings.length,
      findings: findings.map(item => item.content),
      sources: findings.map(item => item.source_url || 'https://api.example.com')
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

module.exports = InternetSearchDebator;
