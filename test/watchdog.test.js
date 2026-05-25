const test = require('node:test');
const assert = require('node:assert');

const Watchdog = require('../watchdog');

test('Watchdog Timeout Controller', async (t) => {
    const watchdog = new Watchdog(100); // 100ms timeout for testing fast runs

    await t.test('should resolve successfully if task completes within timeout', async () => {
        const result = await watchdog.run('SuccessTask', async () => {
            return 'Completed';
        });
        assert.strictEqual(result, 'Completed');
    });

    await t.test('should reject if the underlying task fails', async () => {
        await assert.rejects(async () => {
            await watchdog.run('FailingTask', async () => {
                throw new Error('Task Error');
            });
        }, /Task Error/);
    });

    await t.test('should reject with timeout if task takes too long', async () => {
        await assert.rejects(async () => {
            await watchdog.run('StuckTask', async () => {
                await new Promise(resolve => setTimeout(resolve, 500)); // Takes 500ms (timeout is 100ms)
                return 'StuckResolved';
            });
        }, /timed out after 100ms/);
    });
});
