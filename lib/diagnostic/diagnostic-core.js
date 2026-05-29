const fs = require('fs');
const path = require('path');
const Watchdog = require('../../watchdog');
const Gatekeeper = require('../../gatekeeper');
const LoggerClass = require('../../logger').constructor;

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

async function runCoreDiagnostics({ assert, assertThrows, assertRejects }) {
    console.log('─── Section A: JSON Parser ──────────────────────────\n');
    const r1 = parseModelJson('{"argument":"Ronaldo is the GOAT","intent_to_bluff_or_lie":false}');
    assert('A1 — Clean JSON parses correctly', r1.argument === 'Ronaldo is the GOAT');

    const r2 = parseModelJson('```json\n{"winner":"Messi Fan","verdict_explanation":"Better lie detection"}\n```');
    assert('A2 — Markdown-fenced JSON parses correctly', r2.winner === 'Messi Fan');

    const r3 = parseModelJson('Sure! Here is my response:\n{"lies_or_bluffs_detected":[],"argument":"Messi scored 91 goals in 2012."}');
    assert('A3 — Leading prose JSON parses correctly', Array.isArray(r3.lies_or_bluffs_detected));

    assertThrows('A4 — Malformed JSON throws informative error', () => parseModelJson('{"unclosed: "value"'));

    console.log('\n─── Section B: Watchdog ─────────────────────────────\n');
    const dog = new Watchdog(150);
    const result = await dog.run('fast-task', async () => 'ok');
    assert('B5 — Watchdog resolves fast task', result === 'ok');

    await assertRejects('B6 — Watchdog times out stuck task', async () => {
        await dog.run('slow-task', () => new Promise(r => setTimeout(r, 500)));
    });

    await assertRejects('B7 — Watchdog propagates internal rejection', async () => {
        await dog.run('error-task', async () => { throw new Error('API exploded'); });
    });

    console.log('\n─── Section C: Gatekeeper ───────────────────────────\n');
    const GK_FILE = 'diagnostic_gatekeeper_status.json';
    if (fs.existsSync(GK_FILE)) fs.unlinkSync(GK_FILE);
    const gk = new Gatekeeper(GK_FILE, 0.0005);

    gk.recordUsage({ promptTokenCount: 500, candidatesTokenCount: 200, totalTokenCount: 700 });
    const cost = gk.estimatedCostUSD;
    assert('C8 — Gatekeeper accumulates cost correctly', Math.abs(cost - 0.0000975) < 0.000001, `got ${cost.toFixed(7)}`);

    assertThrows('C9 — Gatekeeper blocks on budget exceed', () => {
        gk.recordUsage({ promptTokenCount: 50000, candidatesTokenCount: 20000, totalTokenCount: 70000 });
    });
    if (fs.existsSync(GK_FILE)) fs.unlinkSync(GK_FILE);

    console.log('\n─── Section D: Logger ───────────────────────────────\n');
    const LOG_DIR = 'diagnostic_logs';
    if (fs.existsSync(LOG_DIR)) fs.rmSync(LOG_DIR, { recursive: true });
    const diagLogger = new LoggerClass(LOG_DIR, 3, 5);

    diagLogger.info('Diagnostic', 'Line 1');
    diagLogger.warn('Diagnostic', 'Line 2');
    diagLogger.error('Diagnostic', 'Line 3');
    diagLogger.info('Diagnostic', 'Line 4');
    diagLogger.info('Diagnostic', 'Line 5');

    assert('D10a — Logger creates log directory', fs.existsSync(LOG_DIR));
    assert('D10b — Logger rolls to app.1.log at line limit', fs.existsSync(path.join(LOG_DIR, 'app.1.log')));

    const firstLine = fs.readFileSync(path.join(LOG_DIR, 'app.1.log'), 'utf8').split('\n').filter(Boolean)[0];
    let logObj;
    try { logObj = JSON.parse(firstLine); } catch { logObj = null; }
    assert('D10c — Logger entries are valid JSON', logObj !== null && logObj.level === 'INFO');

    for (let i = 0; i < 20; i++) diagLogger.info('Diagnostic', `Flood ${i}`);
    assert('D10d — Logger respects max-file FIFO cap (no app.4.log)', !fs.existsSync(path.join(LOG_DIR, 'app.4.log')));
    fs.rmSync(LOG_DIR, { recursive: true });
}

module.exports = { runCoreDiagnostics };
