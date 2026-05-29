'use strict';
/**
 * test/utils_parse.test.js
 * Unit tests for parseModelJson and loadPersona from lib/utils.js
 */

const test   = require('node:test');
const assert = require('node:assert');
const { parseModelJson, loadPersona } = require('../lib/utils');

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
        assert.throws(() => parseModelJson('{unclosed'), /JSON parsing failed/);
    });

    await t.test('handles nested objects correctly', () => {
        const result = parseModelJson('{"outer":{"inner":true},"arr":[1,2,3]}');
        assert.strictEqual(result.outer.inner, true);
        assert.deepStrictEqual(result.arr, [1, 2, 3]);
    });

    await t.test('throws when no JSON brackets exist', () => {
        assert.throws(() => parseModelJson('no json here at all'), /JSON parsing failed/);
    });
});

test('Utils — loadPersona', async (t) => {
    await t.test('loads ronaldo-fan persona with correct display name', () => {
        const persona = loadPersona('ronaldo-fan');
        assert.ok(persona.name, 'Persona must have a name');
        assert.ok(persona.systemPrompt.length > 50, 'System prompt must have content');
        assert.ok(persona.systemPrompt.includes('Ronaldo') || persona.systemPrompt.includes('ronaldo'), 'System prompt must mention Ronaldo');
    });

    await t.test('loads messi-fan persona with correct display name', () => {
        const persona = loadPersona('messi-fan');
        assert.ok(persona.name, 'Persona must have a name');
        assert.ok(persona.systemPrompt.length > 50, 'System prompt must have content');
        assert.ok(persona.systemPrompt.includes('Messi') || persona.systemPrompt.includes('messi'), 'System prompt must mention Messi');
    });

    await t.test('loads referee persona with correct display name', () => {
        const persona = loadPersona('referee');
        assert.ok(persona.name, 'Persona must have a name');
        assert.ok(persona.systemPrompt.includes('referee_commentary'), 'Referee prompt must contain referee_commentary field');
        assert.ok(persona.systemPrompt.includes('next_speaker'), 'Referee prompt must contain next_speaker field');
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
