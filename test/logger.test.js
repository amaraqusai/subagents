const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

// Delete existing logs directory if needed to have a clean test env
const testLogDir = path.resolve('test_logs');
if (fs.existsSync(testLogDir)) {
    fs.rmSync(testLogDir, { recursive: true, force: true });
}

// Dynamically create a test Logger instance
const LoggerClass = require('../logger').constructor;
const testLogger = new LoggerClass('test_logs', 3, 10); // max 3 files, 10 lines per file for fast testing

test('Logger Core Functionality', async (t) => {
    await t.test('should create directory and active app.log file', () => {
        testLogger.info('Test', 'This is a test message');
        assert.ok(fs.existsSync(testLogger.activeFile), 'Active log file should exist');
    });

    await t.test('should output valid JSON entries', () => {
        const content = fs.readFileSync(testLogger.activeFile, 'utf8').trim();
        const logObj = JSON.parse(content);
        assert.strictEqual(logObj.level, 'INFO');
        assert.strictEqual(logObj.component, 'Test');
        assert.strictEqual(logObj.message, 'This is a test message');
        assert.ok(logObj.timestamp);
    });

    await t.test('should roll files correctly when line limit is reached', () => {
        // Write 9 more logs to trigger roll (total 10)
        for (let i = 0; i < 9; i++) {
            testLogger.info('Test', `Message ${i}`);
        }
        
        // Active file should still exist (it restarts), and app.1.log should exist
        assert.ok(fs.existsSync(testLogger.activeFile), 'Active log should restart');
        const rolledFile = path.join(testLogDir, 'app.1.log');
        assert.ok(fs.existsSync(rolledFile), 'app.1.log should be created');
        
        const rolledLines = fs.readFileSync(rolledFile, 'utf8').split('\n').filter(Boolean);
        assert.strictEqual(rolledLines.length, 10, 'Rolled file should contain exactly 10 lines');
    });

    await t.test('should enforce max file rolling constraints (FIFO)', () => {
        // We write enough logs to fill app.log, roll to app.1.log, app.2.log, app.3.log.
        // Since maxFiles is 3, app.4.log should never exist, and writing more should rotate FIFO.
        for (let i = 0; i < 30; i++) {
            testLogger.info('Test', `Fill ${i}`);
        }
        
        assert.ok(fs.existsSync(path.join(testLogDir, 'app.1.log')), 'app.1.log should exist');
        assert.ok(fs.existsSync(path.join(testLogDir, 'app.2.log')), 'app.2.log should exist');
        assert.ok(fs.existsSync(path.join(testLogDir, 'app.3.log')), 'app.3.log should exist');
        assert.ok(!fs.existsSync(path.join(testLogDir, 'app.4.log')), 'app.4.log should NOT exist (capped at 3)');
    });

    // Cleanup after test runs
    if (fs.existsSync(testLogDir)) {
        fs.rmSync(testLogDir, { recursive: true, force: true });
    }
});
