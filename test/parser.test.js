const test = require('node:test');
const assert = require('node:assert');

// Import the canonical implementation from the shared utility module
const { parseModelJson } = require('../lib/utils');

test('JSON Model Response Parser', async (t) => {
    await t.test('should parse clean JSON successfully', () => {
        const json = '{"key": "value", "number": 123}';
        const result = parseModelJson(json);
        assert.strictEqual(result.key, 'value');
        assert.strictEqual(result.number, 123);
    });

    await t.test('should parse JSON wrapped in markdown code blocks', () => {
        const wrapped = '```json\n{"argument": "Ronaldo is the GOAT"}\n```';
        const result = parseModelJson(wrapped);
        assert.strictEqual(result.argument, 'Ronaldo is the GOAT');
    });

    await t.test('should extract and parse JSON with leading or trailing conversational text', () => {
        const dirty = 'Here is your response:\n{"result": "success"}\nHope this helps!';
        const result = parseModelJson(dirty);
        assert.strictEqual(result.result, 'success');
    });

    await t.test('should throw error for invalid JSON format', () => {
        const invalid = '{"argument": "unclosed quotation}';
        assert.throws(() => {
            parseModelJson(invalid);
        }, /JSON parsing failed/);
    });
});
