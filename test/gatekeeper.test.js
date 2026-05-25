const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const testStatusFile = path.resolve('test_gatekeeper_status.json');
if (fs.existsSync(testStatusFile)) {
    fs.unlinkSync(testStatusFile);
}

const Gatekeeper = require('../gatekeeper');
const gatekeeper = new Gatekeeper(testStatusFile, 0.001); // Set a low budget limit ($0.001) for testing budget blocks

test('Gatekeeper Cost & Budget Tracking', async (t) => {
    await t.test('should load correct initial empty status', () => {
        assert.strictEqual(gatekeeper.promptTokens, 0);
        assert.strictEqual(gatekeeper.candidatesTokens, 0);
        assert.strictEqual(gatekeeper.totalTokens, 0);
        assert.strictEqual(gatekeeper.estimatedCostUSD, 0);
    });

    await t.test('should record usage and increase costs', () => {
        gatekeeper.recordUsage({
            promptTokenCount: 1000,
            candidatesTokenCount: 500,
            totalTokenCount: 1500
        });

        assert.strictEqual(gatekeeper.promptTokens, 1000);
        assert.strictEqual(gatekeeper.candidatesTokens, 500);
        assert.strictEqual(gatekeeper.totalTokens, 1500);
        
        // Input: 1000 * 0.075/1M = 0.000075 USD
        // Output: 500 * 0.30/1M = 0.000150 USD
        // Total expected cost = 0.000225 USD
        assert.ok(Math.abs(gatekeeper.estimatedCostUSD - 0.000225) < 0.000001);
    });

    await t.test('should persist usage state to json file', () => {
        assert.ok(fs.existsSync(testStatusFile), 'Status file should be saved');
        const data = JSON.parse(fs.readFileSync(testStatusFile, 'utf8'));
        assert.strictEqual(data.promptTokens, 1000);
        assert.strictEqual(data.totalTokens, 1500);
    });

    await t.test('should block further calls when budget is exceeded', () => {
        // Budget limit is $0.001. Current cost is $0.000225.
        // We trigger a large usage that goes above $0.001.
        assert.throws(() => {
            gatekeeper.recordUsage({
                promptTokenCount: 10000, // Cost ~ 0.00075 USD
                candidatesTokenCount: 5000, // Cost ~ 0.0015 USD (Total > 0.001 USD)
                totalTokenCount: 15000
            });
        }, /budget limit reached/);
    });

    // Cleanup after test runs
    if (fs.existsSync(testStatusFile)) {
        fs.unlinkSync(testStatusFile);
    }
});
