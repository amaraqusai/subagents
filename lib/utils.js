'use strict';
/**
 * lib/utils.js — Shared utility functions used by both debate-cli.js and index.js.
 *
 * Centralising these helpers ensures that any future changes to JSON parsing,
 * persona loading, or Discord message chunking are reflected everywhere at once.
 */

const fs   = require('fs');
const path = require('path');

// ─── JSON Parser ─────────────────────────────────────────────────────────────

/**
 * Robustly extract and parse a JSON object from raw model output text.
 * Two-stage fallback:
 *   1. Bracket extraction  — pulls the outermost { … } block.
 *   2. Markdown stripping  — removes ```json / ``` fences then parses.
 *
 * @param {string} text  Raw text returned by the generative model.
 * @returns {object}     Parsed JavaScript object.
 * @throws {Error}       If both strategies fail.
 */
function parseModelJson(text) {
    try {
        const startIdx = text.indexOf('{');
        const endIdx   = text.lastIndexOf('}');
        if (startIdx === -1 || endIdx === -1) {
            throw new Error('No JSON object characters found');
        }
        return JSON.parse(text.substring(startIdx, endIdx + 1));
    } catch (err) {
        // Fallback: strip markdown fences and retry
        const cleaned = text.replace(/```json|```/g, '').trim();
        try {
            return JSON.parse(cleaned);
        } catch (innerErr) {
            throw new Error(
                `JSON parsing failed: ${err.message}. Original text: ${text.substring(0, 150)}...`
            );
        }
    }
}

// ─── Persona Loader ───────────────────────────────────────────────────────────

/**
 * Load an agent persona from a Markdown file in `.gemini/agents/`.
 * Supports YAML-style frontmatter (between --- delimiters) to extract
 * the display name; the body after the second --- becomes the system prompt.
 *
 * @param {string} name         Persona file basename without extension (e.g. 'ronaldo-fan').
 * @param {object} [logger]     Optional logger instance — used for error logging.
 * @returns {{ name: string, systemPrompt: string }}
 */
function loadPersona(name, logger) {
    const filePath = path.join(__dirname, '..', '.gemini', 'agents', `${name}.md`);
    if (!fs.existsSync(filePath)) {
        const msg = `Persona file not found: ${filePath}`;
        if (logger) logger.error('Utils', msg);
        console.error(`\x1b[31m[Error] ${msg}\x1b[0m`);
        process.exit(1);
    }
    const content = fs.readFileSync(filePath, 'utf8');

    const match = content.match(/---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)/);
    if (!match) return { name, systemPrompt: content };

    const body        = match[2].trim();
    const frontmatter = match[1];
    const nameMatch   = frontmatter.match(/name:\s*(.*)/);
    const displayName = nameMatch ? nameMatch[1].trim() : name;

    return { name: displayName, systemPrompt: body };
}

// ─── Grounding Info Printer (CLI) ─────────────────────────────────────────────

/**
 * Print Google Search grounding metadata to the terminal (CLI mode only).
 *
 * @param {object|undefined} candidate  The response candidate from the Gemini SDK.
 */
function printGroundingInfo(candidate) {
    const searchQueries = candidate?.groundingMetadata?.webSearchQueries;
    const chunks        = candidate?.groundingMetadata?.groundingChunks;

    if (searchQueries && searchQueries.length > 0) {
        console.log(`  \x1b[90m🔍 Search Query: "${searchQueries.join(', ')}"\x1b[0m`);
    }
    if (chunks && chunks.length > 0) {
        const domains = [...new Set(chunks.map(c => {
            try   { return new URL(c.web?.uri || '').hostname.replace('www.', ''); }
            catch { return c.web?.title || 'Web Search'; }
        }))];
        console.log(`  \x1b[90m📚 Sources: ${domains.join(', ')}\x1b[0m`);
    }
}

// ─── Grounding Info Formatter (Discord) ──────────────────────────────────────

/**
 * Format Google Search grounding metadata as a Discord markdown string.
 *
 * @param {object|undefined} candidate  The response candidate from the Gemini SDK.
 * @returns {string}  Formatted metadata string (may be empty).
 */
function getSearchMetadataString(candidate) {
    const searchQueries = candidate?.groundingMetadata?.webSearchQueries;
    const chunks        = candidate?.groundingMetadata?.groundingChunks;
    let metadataStr = '';

    if (searchQueries && searchQueries.length > 0) {
        metadataStr += `*🔍 Search query: "${searchQueries.join(', ')}"\n*`;
    }
    if (chunks && chunks.length > 0) {
        const domains = [...new Set(chunks.map(c => {
            try   { return new URL(c.web?.uri || '').hostname.replace('www.', ''); }
            catch { return c.web?.title || 'Web Search'; }
        }))];
        metadataStr += `*📚 Sources: ${domains.join(', ')}*`;
    }
    return metadataStr;
}

// ─── Discord Long-Message Chunker ─────────────────────────────────────────────

/**
 * Send a potentially long message to a Discord channel, splitting it into
 * chunks of at most `maxLength` characters along line boundaries.
 *
 * Extracted as a pure helper so it can be unit-tested without a live Discord
 * connection. The `sendFn` callback abstracts the actual channel.send() call.
 *
 * @param {Function}       sendFn     Async function that accepts a string and sends it.
 * @param {string}         content    Full message content to send.
 * @param {number}         [maxLength=1900]  Maximum characters per chunk.
 * @returns {Promise<void>}
 */
async function sendLongMessage(sendFn, content, maxLength = 1900) {
    if (content.length <= maxLength) {
        return sendFn(content);
    }

    const lines = content.split('\n');
    let currentChunk = '';

    for (const line of lines) {
        if (currentChunk.length + line.length + 1 > maxLength) {
            await sendFn(currentChunk.trim());
            currentChunk = line + '\n';
        } else {
            currentChunk += line + '\n';
        }
    }

    if (currentChunk.trim().length > 0) {
        await sendFn(currentChunk.trim());
    }
}

// ─── Exports ─────────────────────────────────────────────────────────────────

module.exports = {
    parseModelJson,
    loadPersona,
    printGroundingInfo,
    getSearchMetadataString,
    sendLongMessage
};
