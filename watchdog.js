const logger = require('./logger');

class Watchdog {
    constructor(timeoutMs = 30000) {
        this.timeoutMs = timeoutMs;
    }

    async run(taskName, asyncFn, ...args) {
        let timer;
        const timeoutPromise = new Promise((_, reject) => {
            timer = setTimeout(() => {
                const err = new Error(`Watchdog: Task '${taskName}' timed out after ${this.timeoutMs}ms`);
                logger.error('Watchdog', err.message, { taskName, timeoutMs: this.timeoutMs });
                reject(err);
            }, this.timeoutMs);
        });

        try {
            const result = await Promise.race([
                asyncFn(...args),
                timeoutPromise
            ]);
            clearTimeout(timer);
            return result;
        } catch (err) {
            clearTimeout(timer);
            logger.warn('Watchdog', `Task '${taskName}' failed or timed out: ${err.message}`, { taskName });
            throw err;
        }
    }
}

module.exports = Watchdog;
