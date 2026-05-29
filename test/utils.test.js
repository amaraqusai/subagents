'use strict';
/**
 * test/utils.test.js
 * Unit tests for the shared lib/utils.js module.
 * Covers: parseModelJson, loadPersona, sendLongMessage, printGroundingInfo, getSearchMetadataString
 */

const test   = require('node:test');
const assert = require('node:assert');

const {
    parseModelJson,
    loadPersona,
    sendLongMessage,
    printGroundingInfo,
    getSearchMetadataString
} = require('../lib/utils');

// ─── parseModelJson ───────────────────────────────────────────────────────────

test('Utils — parseModelJson', async (t) => {
    await t.test('parses a clean JSON object', () => {
        const result = parseModelJson('{"key":"value","n":42}');
        assert.strictEqual(result.key, 'value');
        assert.strictEqual(result.n, 42);
    });

    await t.test('extracts JSON from surrounding prose', () => {
        const result = parseModelJson('Here is your answer:\n{"winner":"Messi Fan"}\nHope this helps!');
        assert.strictEqual(result.winner, 'Messi Fan');
    });

    await t.test('strips markdown code fences before parsing', () => {
        const result = parseModelJson('```json\n{"argument":"Ronaldo GOAT"}\n```');
        assert.strictEqual(result.argument, 'Ronaldo GOAT');
    });

    await t.test('throws a descriptive error for malformed JSON', () => {
        assert.throws(
            () => parseModelJson('{unclosed'),
            /JSON parsing failed/
        );
    });

    await t.test('handles nested objects correctly', () => {
        const result = parseModelJson('{"outer":{"inner":true},"arr":[1,2,3]}');
        assert.strictEqual(result.outer.inner, true);
        assert.deepStrictEqual(result.arr, [1, 2, 3]);
    });

    await t.test('throws when no JSON brackets exist', () => {
        assert.throws(
            () => parseModelJson('no json here at all'),
            /JSON parsing failed/
        );
    });
});

// ─── loadPersona ──────────────────────────────────────────────────────────────

test('Utils — loadPersona', async (t) => {
    await t.test('loads ronaldo-fan persona with correct display name', () => {
        const persona = loadPersona('ronaldo-fan');
        assert.ok(persona.name, 'Persona must have a name');
        assert.ok(persona.systemPrompt.length > 50, 'System prompt must have content');
        assert.ok(persona.systemPrompt.includes('Ronaldo') || persona.systemPrompt.includes('ronaldo'),
            'System prompt must mention Ronaldo');
    });

    await t.test('loads messi-fan persona with correct display name', () => {
        const persona = loadPersona('messi-fan');
        assert.ok(persona.name, 'Persona must have a name');
        assert.ok(persona.systemPrompt.length > 50, 'System prompt must have content');
        assert.ok(persona.systemPrompt.includes('Messi') || persona.systemPrompt.includes('messi'),
            'System prompt must mention Messi');
    });

    await t.test('loads referee persona with correct display name', () => {
        const persona = loadPersona('referee');
        assert.ok(persona.name, 'Persona must have a name');
        assert.ok(persona.systemPrompt.includes('referee_commentary'),
            'Referee prompt must contain referee_commentary field');
        assert.ok(persona.systemPrompt.includes('next_speaker'),
            'Referee prompt must contain next_speaker field');
    });

    await t.test('all three personas contain intent_to_bluff_or_lie OR referee_commentary', () => {
        const ronaldo = loadPersona('ronaldo-fan');
        const messi   = loadPersona('messi-fan');
        const referee = loadPersona('referee');
        assert.ok(ronaldo.systemPrompt.includes('intent_to_bluff_or_lie'));
        assert.ok(messi.systemPrompt.includes('intent_to_bluff_or_lie'));
        assert.ok(referee.systemPrompt.includes('referee_commentary'));
    });
});

// ─── sendLongMessage ──────────────────────────────────────────────────────────

test('Utils — sendLongMessage', async (t) => {
    await t.test('sends short message in a single call', async () => {
        const sent = [];
        const send = async (chunk) => sent.push(chunk);

        await sendLongMessage(send, 'Hello world!');
        assert.strictEqual(sent.length, 1);
        assert.strictEqual(sent[0], 'Hello world!');
    });

    await t.test('splits message that exceeds maxLength along line boundaries', async () => {
        const sent = [];
        const send = async (chunk) => sent.push(chunk);

        // Build a message where each line is 100 chars, total > 300 chars
        const line = 'A'.repeat(100);
        const content = [line, line, line, line].join('\n'); // 400 chars + 3 newlines

        await sendLongMessage(send, content, 250);
        assert.ok(sent.length >= 2, `Expected 2+ chunks, got ${sent.length}`);
        sent.forEach(chunk => {
            assert.ok(chunk.length <= 250,
                `Chunk length ${chunk.length} exceeds maxLength 250`);
        });
    });

    await t.test('reassembles all content across chunks without data loss', async () => {
        const sent = [];
        const send = async (chunk) => sent.push(chunk);

        const lines = Array.from({ length: 20 }, (_, i) => `Line ${i + 1}: ${'x'.repeat(80)}`);
        const content = lines.join('\n');

        await sendLongMessage(send, content, 300);
        const reassembled = sent.join('\n');
        lines.forEach(line => {
            assert.ok(reassembled.includes(line.trim()),
                `Line "${line.substring(0, 20)}..." was lost in chunking`);
        });
    });

    await t.test('handles exact boundary — message exactly at maxLength sends as one chunk', async () => {
        const sent = [];
        const send = async (chunk) => sent.push(chunk);
        const content = 'B'.repeat(1900);

        await sendLongMessage(send, content, 1900);
        assert.strictEqual(sent.length, 1);
    });

    await t.test('handles message one character over maxLength — splits into two chunks', async () => {
        const sent = [];
        const send = async (chunk) => sent.push(chunk);
        // Two lines, each 1000 chars — total 2001 chars, above 1900 limit
        const content = `${'C'.repeat(1000)}\n${'D'.repeat(1000)}`;

        await sendLongMessage(send, content, 1900);
        assert.strictEqual(sent.length, 2);
    });

    await t.test('empty content sends one empty call', async () => {
        const sent = [];
        const send = async (chunk) => sent.push(chunk);
        await sendLongMessage(send, '');
        assert.strictEqual(sent.length, 1);
    });
});

// ─── printGroundingInfo ───────────────────────────────────────────────────────

test('Utils — printGroundingInfo', async (t) => {
    await t.test('does not throw when candidate is undefined', () => {
        assert.doesNotThrow(() => printGroundingInfo(undefined));
    });

    await t.test('does not throw when groundingMetadata is missing', () => {
        assert.doesNotThrow(() => printGroundingInfo({}));
    });

    await t.test('does not throw when grounding arrays are empty', () => {
        assert.doesNotThrow(() => printGroundingInfo({
            groundingMetadata: { webSearchQueries: [], groundingChunks: [] }
        }));
    });
});

// ─── getSearchMetadataString ──────────────────────────────────────────────────

test('Utils — getSearchMetadataString', async (t) => {
    await t.test('returns empty string when candidate is undefined', () => {
        const result = getSearchMetadataString(undefined);
        assert.strictEqual(result, '');
    });

    await t.test('returns empty string when groundingMetadata is absent', () => {
        const result = getSearchMetadataString({});
        assert.strictEqual(result, '');
    });

    await t.test('includes search query when webSearchQueries is populated', () => {
        const result = getSearchMetadataString({
            groundingMetadata: {
                webSearchQueries: ['Ronaldo CL goals'],
                groundingChunks: []
            }
        });
        assert.ok(result.includes('Ronaldo CL goals'), `Expected query in output, got: ${result}`);
    });

    await t.test('includes domain names from groundingChunks', () => {
        const result = getSearchMetadataString({
            groundingMetadata: {
                webSearchQueries: [],
                groundingChunks: [
                    { web: { uri: 'https://www.transfermarkt.com/ronaldo/goals', title: 'Transfermarkt' } }
                ]
            }
        });
        assert.ok(result.includes('transfermarkt.com'), `Expected domain in output, got: ${result}`);
    });

    await t.test('deduplicates domains from multiple chunks', () => {
        const result = getSearchMetadataString({
            groundingMetadata: {
                webSearchQueries: [],
                groundingChunks: [
                    { web: { uri: 'https://www.transfermarkt.com/page1' } },
                    { web: { uri: 'https://www.transfermarkt.com/page2' } },
                    { web: { uri: 'https://www.wikipedia.org/messi' } }
                ]
            }
        });
        const transfermarktCount = (result.match(/transfermarkt\.com/g) || []).length;
        assert.strictEqual(transfermarktCount, 1, 'Domain should appear only once after dedup');
        assert.ok(result.includes('wikipedia.org'));
    });
});
