'use strict';
/**
 * test/utils_messaging.test.js
 * Unit tests for sendLongMessage, printGroundingInfo, getSearchMetadataString
 */

const test   = require('node:test');
const assert = require('node:assert');
const { sendLongMessage, printGroundingInfo, getSearchMetadataString } = require('../lib/utils');

test('Utils — sendLongMessage', async (t) => {
    await t.test('sends short message in a single call', async () => {
        const sent = [];
        await sendLongMessage(async (chunk) => sent.push(chunk), 'Hello world!');
        assert.strictEqual(sent.length, 1);
        assert.strictEqual(sent[0], 'Hello world!');
    });

    await t.test('splits message that exceeds maxLength along line boundaries', async () => {
        const sent = [];
        const line = 'A'.repeat(100);
        const content = [line, line, line, line].join('\n');
        await sendLongMessage(async (chunk) => sent.push(chunk), content, 250);
        assert.ok(sent.length >= 2, `Expected 2+ chunks, got ${sent.length}`);
        sent.forEach(chunk => assert.ok(chunk.length <= 250, `Chunk length ${chunk.length} exceeds maxLength 250`));
    });

    await t.test('reassembles all content across chunks without data loss', async () => {
        const sent = [];
        const lines = Array.from({ length: 20 }, (_, i) => `Line ${i + 1}: ${'x'.repeat(80)}`);
        const content = lines.join('\n');
        await sendLongMessage(async (chunk) => sent.push(chunk), content, 300);
        const reassembled = sent.join('\n');
        lines.forEach(line => assert.ok(reassembled.includes(line.trim()), `Line lost in chunking: "${line.substring(0, 20)}..."`));
    });

    await t.test('handles exact boundary — message exactly at maxLength sends as one chunk', async () => {
        const sent = [];
        await sendLongMessage(async (chunk) => sent.push(chunk), 'B'.repeat(1900), 1900);
        assert.strictEqual(sent.length, 1);
    });

    await t.test('handles message one character over maxLength — splits into two chunks', async () => {
        const sent = [];
        const content = `${'C'.repeat(1000)}\n${'D'.repeat(1000)}`;
        await sendLongMessage(async (chunk) => sent.push(chunk), content, 1900);
        assert.strictEqual(sent.length, 2);
    });

    await t.test('empty content sends one empty call', async () => {
        const sent = [];
        await sendLongMessage(async (chunk) => sent.push(chunk), '');
        assert.strictEqual(sent.length, 1);
    });
});

test('Utils — printGroundingInfo', async (t) => {
    await t.test('does not throw when candidate is undefined', () => { assert.doesNotThrow(() => printGroundingInfo(undefined)); });
    await t.test('does not throw when groundingMetadata is missing', () => { assert.doesNotThrow(() => printGroundingInfo({})); });
    await t.test('does not throw when grounding arrays are empty', () => { assert.doesNotThrow(() => printGroundingInfo({ groundingMetadata: { webSearchQueries: [], groundingChunks: [] } })); });
});

test('Utils — getSearchMetadataString', async (t) => {
    await t.test('returns empty string when candidate is undefined', () => { assert.strictEqual(getSearchMetadataString(undefined), ''); });
    await t.test('returns empty string when groundingMetadata is absent', () => { assert.strictEqual(getSearchMetadataString({}), ''); });

    await t.test('includes search query when webSearchQueries is populated', () => {
        const result = getSearchMetadataString({ groundingMetadata: { webSearchQueries: ['Ronaldo CL goals'], groundingChunks: [] } });
        assert.ok(result.includes('Ronaldo CL goals'), `Expected query in output, got: ${result}`);
    });

    await t.test('includes domain names from groundingChunks', () => {
        const result = getSearchMetadataString({ groundingMetadata: { webSearchQueries: [], groundingChunks: [{ web: { uri: 'https://www.transfermarkt.com/ronaldo/goals', title: 'Transfermarkt' } }] } });
        assert.ok(result.includes('transfermarkt.com'), `Expected domain in output, got: ${result}`);
    });

    await t.test('deduplicates domains from multiple chunks', () => {
        const result = getSearchMetadataString({ groundingMetadata: { webSearchQueries: [], groundingChunks: [
            { web: { uri: 'https://www.transfermarkt.com/page1' } },
            { web: { uri: 'https://www.transfermarkt.com/page2' } },
            { web: { uri: 'https://www.wikipedia.org/messi' } }
        ] } });
        const count = (result.match(/transfermarkt\.com/g) || []).length;
        assert.strictEqual(count, 1, 'Domain should appear only once after dedup');
        assert.ok(result.includes('wikipedia.org'));
    });
});
