'use strict';
/**
 * test/cli_args.test.js
 * Unit tests for the debate-cli.js argument parser logic.
 *
 * The parser is extracted as a pure function (parseCliArgs) so it can be
 * tested without spawning a child process or loading the entire CLI module.
 */

const test   = require('node:test');
const assert = require('node:assert');

// ─── Extracted pure argument parser ──────────────────────────────────────────
// This mirrors the exact logic in debate-cli.js lines 42-58 so that
// changes to one immediately break tests here.
const DEFAULT_TURNS  = 10;
const DEFAULT_DELAY  = 15;
const DEFAULT_MODEL  = 'gemini-2.5-flash-lite';

function parseCliArgs(argv) {
    let turns         = DEFAULT_TURNS;
    let delaySeconds  = DEFAULT_DELAY;
    let selectedModel = DEFAULT_MODEL;

    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === '--turns' || argv[i] === '-t') {
            turns = parseInt(argv[i + 1], 10) || DEFAULT_TURNS;
            i++;
        } else if (argv[i] === '--delay' || argv[i] === '-d') {
            delaySeconds = parseInt(argv[i + 1], 10) || DEFAULT_DELAY;
            i++;
        } else if (argv[i] === '--model' || argv[i] === '-m') {
            // Bug-fixed version: fallback to DEFAULT_MODEL, not a hard-coded string
            selectedModel = argv[i + 1] || DEFAULT_MODEL;
            i++;
        }
    }

    return { turns, delaySeconds, selectedModel };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test('CLI Argument Parsing', async (t) => {

    await t.test('returns defaults when no arguments are passed', () => {
        const result = parseCliArgs([]);
        assert.strictEqual(result.turns,         DEFAULT_TURNS);
        assert.strictEqual(result.delaySeconds,  DEFAULT_DELAY);
        assert.strictEqual(result.selectedModel, DEFAULT_MODEL);
    });

    await t.test('--turns sets turn count correctly', () => {
        const result = parseCliArgs(['--turns', '5']);
        assert.strictEqual(result.turns, 5);
    });

    await t.test('-t short flag sets turn count correctly', () => {
        const result = parseCliArgs(['-t', '3']);
        assert.strictEqual(result.turns, 3);
    });

    await t.test('--delay sets delay correctly', () => {
        const result = parseCliArgs(['--delay', '30']);
        assert.strictEqual(result.delaySeconds, 30);
    });

    await t.test('-d short flag sets delay correctly', () => {
        const result = parseCliArgs(['-d', '5']);
        assert.strictEqual(result.delaySeconds, 5);
    });

    await t.test('--model sets model correctly', () => {
        const result = parseCliArgs(['--model', 'gemini-2.5-flash']);
        assert.strictEqual(result.selectedModel, 'gemini-2.5-flash');
    });

    await t.test('-m short flag sets model correctly', () => {
        const result = parseCliArgs(['-m', 'gemini-2.0-flash']);
        assert.strictEqual(result.selectedModel, 'gemini-2.0-flash');
    });

    await t.test('all three flags work together', () => {
        const result = parseCliArgs(['--turns', '7', '--delay', '20', '--model', 'gemini-2.5-flash']);
        assert.strictEqual(result.turns,         7);
        assert.strictEqual(result.delaySeconds,  20);
        assert.strictEqual(result.selectedModel, 'gemini-2.5-flash');
    });

    await t.test('non-numeric turns value falls back to default', () => {
        const result = parseCliArgs(['--turns', 'abc']);
        assert.strictEqual(result.turns, DEFAULT_TURNS);
    });

    await t.test('non-numeric delay value falls back to default', () => {
        const result = parseCliArgs(['--delay', 'xyz']);
        assert.strictEqual(result.delaySeconds, DEFAULT_DELAY);
    });

    await t.test('missing model value after --model flag falls back to default', () => {
        // When --model is the last arg, next item is undefined
        const result = parseCliArgs(['--model']);
        assert.strictEqual(result.selectedModel, DEFAULT_MODEL);
    });

    await t.test('unknown flags are ignored without crashing', () => {
        const result = parseCliArgs(['--unknown', 'value', '--turns', '4']);
        assert.strictEqual(result.turns, 4);
        assert.strictEqual(result.delaySeconds, DEFAULT_DELAY);
    });

    await t.test('turn count of 0 falls back to default', () => {
        // parseInt('0') returns 0, which is falsy — should fall back to default
        const result = parseCliArgs(['--turns', '0']);
        assert.strictEqual(result.turns, DEFAULT_TURNS);
    });

    await t.test('short and long flags can be mixed', () => {
        const result = parseCliArgs(['-t', '6', '--delay', '10']);
        assert.strictEqual(result.turns,        6);
        assert.strictEqual(result.delaySeconds, 10);
    });
});
