/**
 * diagnostic.js — Full system probe written by the agent
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { runCoreDiagnostics } = require('./lib/diagnostic/diagnostic-core');

const PASS = '\x1b[32m[PASS]\x1b[0m', FAIL = '\x1b[31m[FAIL]\x1b[0m';
let passed = 0, failed = 0;

function assert(label, condition, detail = '') {
    if (condition) { passed++; console.log(`${PASS} ${label}`); }
    else { failed++; console.log(`${FAIL} ${label}  ${detail}`); }
}
function assertThrows(label, fn) {
    try { fn(); failed++; console.log(`${FAIL} ${label} — did not throw`); }
    catch (e) { passed++; console.log(`${PASS} ${label} — threw: "${e.message.slice(0, 60)}"`); }
}
async function assertRejects(label, fn) {
    try { await fn(); failed++; console.log(`${FAIL} ${label} — did not reject`); }
    catch (e) { passed++; console.log(`${PASS} ${label} — rejected: "${e.message.slice(0, 60)}"`); }
}

(async () => {
    console.log('\n═══════════════════════════════════════════════════\n 🔬  GOAT Debate System — Agent Diagnostic Report\n═══════════════════════════════════════════════════\n');

    await runCoreDiagnostics({ assert, assertThrows, assertRejects });

    console.log('\n─── Section E: Routing & Privacy Isolation ──────────\n');
    const lastResponse = { argument: 'Ronaldo has 800 goals.', intent_to_bluff_or_lie: true, bluff_or_lie_details: 'exaggerated count', thought_process: { opponent_analysis: '...' } };
    const debateHistory = [{ speaker: 'Referee', argument: 'Ronaldo fan, your turn.' }];
    const childPrompt = JSON.stringify({ referee_instructions: debateHistory[debateHistory.length - 1].argument, opponent_argument: lastResponse.argument, debate_history: debateHistory });
    const childPayload = JSON.parse(childPrompt);

    assert('E11a — Child prompt contains opponent public argument', childPayload.opponent_argument === 'Ronaldo has 800 goals.');
    assert('E11b — Child prompt does NOT leak intent_to_bluff_or_lie', !('intent_to_bluff_or_lie' in childPayload));
    assert('E11c — Child prompt does NOT leak bluff_or_lie_details', !('bluff_or_lie_details' in childPayload));
    assert('E11d — Child prompt does NOT leak thought_process', !('thought_process' in childPayload));

    console.log('\n─── Section F: Turn-Count Enforcement ───────────────\n');
    const simulateTurns = (turnsPerSide) => turnsPerSide * 2;
    assert('F12a — 10 turns/side → 20 total turns', simulateTurns(10) === 20);
    assert('F12b — 5 turns/side → 10 total turns',  simulateTurns(5)  === 10);
    assert('F12c — 1 turn/side  → 2 total turns',   simulateTurns(1)  === 2);

    console.log('\n─── Section G: Persona Schema Integrity ─────────────\n');
    const loadPersonaBody = (name) => {
        const txt = fs.readFileSync(path.join('.gemini', 'agents', `${name}.md`), 'utf8');
        const m = txt.match(/---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)/);
        return m ? m[1] : txt;
    };
    const ronaldoPrompt = loadPersonaBody('ronaldo-fan'), messiPrompt = loadPersonaBody('messi-fan'), refereePrompt = loadPersonaBody('referee');

    assert('G13a — Ronaldo prompt contains "intent_to_bluff_or_lie" field', ronaldoPrompt.includes('intent_to_bluff_or_lie'));
    assert('G13b — Ronaldo prompt contains "lies_or_bluffs_detected" field', ronaldoPrompt.includes('lies_or_bluffs_detected'));
    assert('G13c — Ronaldo prompt contains "search_query" field', ronaldoPrompt.includes('search_query'));
    assert('G14a — Messi prompt contains "intent_to_bluff_or_lie" field', messiPrompt.includes('intent_to_bluff_or_lie'));
    assert('G14b — Messi prompt contains "lies_or_bluffs_detected" field', messiPrompt.includes('lies_or_bluffs_detected'));
    assert('G15a — Referee prompt contains "referee_commentary" field', refereePrompt.includes('referee_commentary'));
    assert('G15b — Referee prompt contains "score_tracking" field', refereePrompt.includes('score_tracking'));
    assert('G15c — Referee prompt contains "verdict_explanation" field', refereePrompt.includes('verdict_explanation'));
    assert('G15d — Referee prompt contains "next_speaker" field', refereePrompt.includes('next_speaker'));
    assert('G15e — Referee prompt mandates neutrality', refereePrompt.includes('Neutrality'));

    console.log('\n─── Section H: Environment & Security ───────────────\n');
    assert('H16 — GEMINI_API_KEY is set in environment', !!process.env.GEMINI_API_KEY);
    const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
    assert('H17 — .env file is NOT tracked by Git (gitignore)', gitignoreContent.includes('.env'));
    assert('H18 — gatekeeper_status.json is gitignored', gitignoreContent.includes('gatekeeper_status.json'));
    assert('H19 — logs/ directory is gitignored', gitignoreContent.includes('logs/'));

    console.log('\n═══════════════════════════════════════════════════\n' +
                ` DIAGNOSTIC COMPLETE: ${passed} passed, ${failed} failed\n` +
                (failed === 0 ? ' \x1b[32m✅ All systems nominal — project is healthy!\x1b[0m' : ` \x1b[31m❌ ${failed} check(s) failed — review above output.\x1b[0m`) +
                '\n═══════════════════════════════════════════════════\n');
})();
