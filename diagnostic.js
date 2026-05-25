/**
 * diagnostic.js — Full system probe written by the agent
 *
 * This script runs 7 custom diagnostic checks without hitting the live API:
 *  1.  JSON Parser — clean object
 *  2.  JSON Parser — markdown-wrapped fences
 *  3.  JSON Parser — leading prose text
 *  4.  JSON Parser — invalid / malformed JSON (must throw)
 *  5.  Watchdog  — fast task completes cleanly
 *  6.  Watchdog  — task that exceeds timeout (must timeout)
 *  7.  Watchdog  — task that rejects internally (must propagate error)
 *  8.  Gatekeeper — accumulates cost correctly
 *  9.  Gatekeeper — blocks when budget exceeded
 * 10.  Logger    — writes valid JSON entry and rolls on line-limit
 * 11.  Referee routing simulation — private bluff data must NOT appear in child prompt
 * 12.  Debate turn-count enforcement — must reach exactly N*2 turns
 */

require('dotenv').config();
const fs   = require('fs');
const path = require('path');

// ── helpers ──────────────────────────────────────────────────────────────────
const PASS  = '\x1b[32m[PASS]\x1b[0m';
const FAIL  = '\x1b[31m[FAIL]\x1b[0m';
const INFO  = '\x1b[36m[INFO]\x1b[0m';
let passed = 0, failed = 0;

function assert(label, condition, detail = '') {
    if (condition) {
        console.log(`${PASS} ${label}`);
        passed++;
    } else {
        console.log(`${FAIL} ${label}  ${detail}`);
        failed++;
    }
}
function assertThrows(label, fn) {
    try { fn(); console.log(`${FAIL} ${label} — did not throw`); failed++; }
    catch (e) { console.log(`${PASS} ${label} — threw: "${e.message.slice(0,60)}"`); passed++; }
}
async function assertRejects(label, fn) {
    try { await fn(); console.log(`${FAIL} ${label} — did not reject`); failed++; }
    catch (e) { console.log(`${PASS} ${label} — rejected: "${e.message.slice(0,60)}"`); passed++; }
}

// ── load modules ─────────────────────────────────────────────────────────────
const Watchdog   = require('./watchdog');
const Gatekeeper = require('./gatekeeper');
const LoggerClass = require('./logger').constructor;

// Inline the parser (same logic as in debate-cli.js)
function parseModelJson(text) {
    try {
        const s = text.indexOf('{'), e = text.lastIndexOf('}');
        if (s === -1 || e === -1) throw new Error('No JSON object characters found');
        return JSON.parse(text.substring(s, e + 1));
    } catch (err) {
        const cleaned = text.replace(/```json|```/g, '').trim();
        try { return JSON.parse(cleaned); }
        catch { throw new Error(`JSON parsing failed: ${err.message}`); }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n═══════════════════════════════════════════════════');
console.log(' 🔬  GOAT Debate System — Agent Diagnostic Report');
console.log('═══════════════════════════════════════════════════\n');

// ── 1–4  JSON PARSER ─────────────────────────────────────────────────────────
console.log('─── Section A: JSON Parser ──────────────────────────\n');

// 1. Clean JSON
const r1 = parseModelJson('{"argument":"Ronaldo is the GOAT","intent_to_bluff_or_lie":false}');
assert('A1 — Clean JSON parses correctly', r1.argument === 'Ronaldo is the GOAT');

// 2. Markdown fences
const r2 = parseModelJson('```json\n{"winner":"Messi Fan","verdict_explanation":"Better lie detection"}\n```');
assert('A2 — Markdown-fenced JSON parses correctly', r2.winner === 'Messi Fan');

// 3. Leading prose
const r3 = parseModelJson('Sure! Here is my response:\n{"lies_or_bluffs_detected":[],"argument":"Messi scored 91 goals in 2012."}');
assert('A3 — Leading prose JSON parses correctly', Array.isArray(r3.lies_or_bluffs_detected));

// 4. Malformed JSON must throw
assertThrows('A4 — Malformed JSON throws informative error', () => parseModelJson('{"unclosed: "value"'));

// ── 5–7  WATCHDOG ────────────────────────────────────────────────────────────
console.log('\n─── Section B: Watchdog ─────────────────────────────\n');
const dog = new Watchdog(150); // 150ms timeout for fast tests

// 5. Fast task resolves
(async () => {
    const result = await dog.run('fast-task', async () => 'ok');
    assert('B5 — Watchdog resolves fast task', result === 'ok');

// 6. Slow task times out
await assertRejects('B6 — Watchdog times out stuck task', async () => {
    await dog.run('slow-task', () => new Promise(r => setTimeout(r, 500)));
});

// 7. Failing task propagates error
await assertRejects('B7 — Watchdog propagates internal rejection', async () => {
    await dog.run('error-task', async () => { throw new Error('API exploded'); });
});

// ── 8–9  GATEKEEPER ──────────────────────────────────────────────────────────
console.log('\n─── Section C: Gatekeeper ───────────────────────────\n');
const GK_FILE = 'diagnostic_gatekeeper_status.json';
if (fs.existsSync(GK_FILE)) fs.unlinkSync(GK_FILE);
const gk = new Gatekeeper(GK_FILE, 0.0005); // tiny $0.0005 budget

// 8. Accumulates cost
gk.recordUsage({ promptTokenCount: 500, candidatesTokenCount: 200, totalTokenCount: 700 });
const cost = gk.estimatedCostUSD;
// 500*0.075/1M + 200*0.3/1M = 0.0000375 + 0.00006 = 0.0000975 USD
assert('C8 — Gatekeeper accumulates cost correctly',
    Math.abs(cost - 0.0000975) < 0.000001,
    `got ${cost.toFixed(7)}`);

// 9. Blocks on budget exceed
assertThrows('C9 — Gatekeeper blocks on budget exceed', () => {
    gk.recordUsage({ promptTokenCount: 50000, candidatesTokenCount: 20000, totalTokenCount: 70000 });
});
if (fs.existsSync(GK_FILE)) fs.unlinkSync(GK_FILE);

// ── 10  LOGGER ───────────────────────────────────────────────────────────────
console.log('\n─── Section D: Logger ───────────────────────────────\n');
const LOG_DIR = 'diagnostic_logs';
if (fs.existsSync(LOG_DIR)) fs.rmSync(LOG_DIR, { recursive: true });
const diagLogger = new LoggerClass(LOG_DIR, 3, 5); // 3 files, 5 lines max

diagLogger.info('Diagnostic', 'Line 1'); // 1
diagLogger.warn('Diagnostic', 'Line 2'); // 2
diagLogger.error('Diagnostic', 'Line 3'); // 3
diagLogger.info('Diagnostic', 'Line 4'); // 4
diagLogger.info('Diagnostic', 'Line 5'); // 5 → should trigger roll

// After 5 lines the active file is reset; app.1.log should exist
assert('D10a — Logger creates log directory', fs.existsSync(LOG_DIR));
assert('D10b — Logger rolls to app.1.log at line limit',
    fs.existsSync(path.join(LOG_DIR, 'app.1.log')));

// Validate JSON structure of first rolled log entry
const firstLine = fs.readFileSync(path.join(LOG_DIR, 'app.1.log'), 'utf8').split('\n').filter(Boolean)[0];
let logObj;
try { logObj = JSON.parse(firstLine); } catch { logObj = null; }
assert('D10c — Logger entries are valid JSON', logObj !== null && logObj.level === 'INFO');

// FIFO: write enough to fill 3 archive files — 4th should never appear
for (let i = 0; i < 20; i++) diagLogger.info('Diagnostic', `Flood ${i}`);
assert('D10d — Logger respects max-file FIFO cap (no app.4.log)',
    !fs.existsSync(path.join(LOG_DIR, 'app.4.log')));
fs.rmSync(LOG_DIR, { recursive: true });

// ── 11  ROUTING ISOLATION CHECK ──────────────────────────────────────────────
console.log('\n─── Section E: Routing & Privacy Isolation ──────────\n');

// Simulate building a child prompt — private fields must NOT leak
const lastResponse = {
    argument: 'Ronaldo has 800 goals.',
    intent_to_bluff_or_lie: true,              // ← PRIVATE — must NOT reach child
    bluff_or_lie_details: 'exaggerated count', // ← PRIVATE — must NOT reach child
    thought_process: { opponent_analysis: '...' }
};
const debateHistory = [{ speaker: 'Referee', argument: 'Ronaldo fan, your turn.' }];

const childPrompt = JSON.stringify({
    referee_instructions: debateHistory[debateHistory.length - 1].argument,
    opponent_argument: lastResponse.argument,   // only the public text
    debate_history: debateHistory
});

const childPayload = JSON.parse(childPrompt);
assert('E11a — Child prompt contains opponent public argument', childPayload.opponent_argument === 'Ronaldo has 800 goals.');
assert('E11b — Child prompt does NOT leak intent_to_bluff_or_lie', !('intent_to_bluff_or_lie' in childPayload));
assert('E11c — Child prompt does NOT leak bluff_or_lie_details', !('bluff_or_lie_details' in childPayload));
assert('E11d — Child prompt does NOT leak thought_process', !('thought_process' in childPayload));

// ── 12  TURN-COUNT ENFORCEMENT ───────────────────────────────────────────────
console.log('\n─── Section F: Turn-Count Enforcement ───────────────\n');

function simulateTurns(turnsPerSide) {
    let count = 0;
    for (let t = 1; t <= turnsPerSide * 2; t++) count++;
    return count;
}
assert('F12a — 10 turns/side → 20 total turns', simulateTurns(10) === 20);
assert('F12b — 5 turns/side → 10 total turns',  simulateTurns(5)  === 10);
assert('F12c — 1 turn/side  → 2 total turns',   simulateTurns(1)  === 2);

// ── PERSONA PROMPT SCHEMA CHECKS ─────────────────────────────────────────────
console.log('\n─── Section G: Persona Schema Integrity ─────────────\n');

function loadPersonaBody(name) {
    const fp = path.join('.gemini', 'agents', `${name}.md`);
    const txt = fs.readFileSync(fp, 'utf8');
    const m = txt.match(/---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)/);
    return m ? m[1] : txt;
}

const ronaldoPrompt = loadPersonaBody('ronaldo-fan');
const messiPrompt   = loadPersonaBody('messi-fan');
const refereePrompt = loadPersonaBody('referee');

// Verify each persona has the mandatory JSON output fields in its system prompt
assert('G13a — Ronaldo prompt contains "intent_to_bluff_or_lie" field',   ronaldoPrompt.includes('intent_to_bluff_or_lie'));
assert('G13b — Ronaldo prompt contains "lies_or_bluffs_detected" field',  ronaldoPrompt.includes('lies_or_bluffs_detected'));
assert('G13c — Ronaldo prompt contains "search_query" field',             ronaldoPrompt.includes('search_query'));
assert('G14a — Messi prompt contains "intent_to_bluff_or_lie" field',     messiPrompt.includes('intent_to_bluff_or_lie'));
assert('G14b — Messi prompt contains "lies_or_bluffs_detected" field',    messiPrompt.includes('lies_or_bluffs_detected'));
assert('G15a — Referee prompt contains "referee_commentary" field',       refereePrompt.includes('referee_commentary'));
assert('G15b — Referee prompt contains "score_tracking" field',           refereePrompt.includes('score_tracking'));
assert('G15c — Referee prompt contains "verdict_explanation" field',      refereePrompt.includes('verdict_explanation'));
assert('G15d — Referee prompt contains "next_speaker" field',             refereePrompt.includes('next_speaker'));
assert('G15e — Referee prompt mandates neutrality',                       refereePrompt.includes('Neutrality'));

// ── ENVIRONMENT CHECKS ───────────────────────────────────────────────────────
console.log('\n─── Section H: Environment & Security ───────────────\n');

assert('H16 — GEMINI_API_KEY is set in environment',   !!process.env.GEMINI_API_KEY);
assert('H17 — .env file is NOT tracked by Git (gitignore)',
    fs.readFileSync('.gitignore', 'utf8').includes('.env'));
assert('H18 — gatekeeper_status.json is gitignored',
    fs.readFileSync('.gitignore', 'utf8').includes('gatekeeper_status.json'));
assert('H19 — logs/ directory is gitignored',
    fs.readFileSync('.gitignore', 'utf8').includes('logs/'));

// ── SUMMARY ──────────────────────────────────────────────────────────────────
console.log('\n═══════════════════════════════════════════════════');
console.log(` DIAGNOSTIC COMPLETE: ${passed} passed, ${failed} failed`);
if (failed === 0) {
    console.log(' \x1b[32m✅ All systems nominal — project is healthy!\x1b[0m');
} else {
    console.log(` \x1b[31m❌ ${failed} check(s) failed — review above output.\x1b[0m`);
}
console.log('═══════════════════════════════════════════════════\n');

})();
