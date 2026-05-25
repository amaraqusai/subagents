const fs = require('fs');
const path = require('path');

class Logger {
    constructor(logDir = 'logs', maxFiles = 20, maxLines = 500) {
        this.logDir = path.resolve(logDir);
        this.maxFiles = maxFiles;
        this.maxLines = maxLines;
        this.activeFile = path.join(this.logDir, 'app.log');
        
        this.initDir();
    }

    initDir() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    log(level, component, message, meta = {}) {
        this.initDir();
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            component,
            message,
            meta
        };

        const logLine = JSON.stringify(logEntry) + '\n';
        fs.appendFileSync(this.activeFile, logLine, 'utf8');

        this.checkAndRoll();
    }

    info(component, message, meta) { this.log('INFO', component, message, meta); }
    warn(component, message, meta) { this.log('WARN', component, message, meta); }
    error(component, message, meta) { this.log('ERROR', component, message, meta); }

    checkAndRoll() {
        if (!fs.existsSync(this.activeFile)) return;
        const content = fs.readFileSync(this.activeFile, 'utf8');
        const lines = content.split('\n').filter(Boolean);
        
        if (lines.length >= this.maxLines) {
            // Remove the absolute oldest if it reaches maximum capacity
            const oldestFile = path.join(this.logDir, `app.${this.maxFiles}.log`);
            if (fs.existsSync(oldestFile)) {
                try {
                    fs.unlinkSync(oldestFile);
                } catch (e) {
                    // Ignore deletion errors during concurrent access
                }
            }

            // Slide existing files: index 19 -> 20, 18 -> 19 ...
            for (let i = this.maxFiles - 1; i >= 1; i--) {
                const src = path.join(this.logDir, `app.${i}.log`);
                const dest = path.join(this.logDir, `app.${i + 1}.log`);
                if (fs.existsSync(src)) {
                    try {
                        fs.renameSync(src, dest);
                    } catch (e) {
                        // Ignore rename errors
                    }
                }
            }

            // Shift current log to app.1.log
            try {
                fs.renameSync(this.activeFile, path.join(this.logDir, 'app.1.log'));
                // Create a new empty active log file immediately
                fs.writeFileSync(this.activeFile, '', 'utf8');
            } catch (e) {
                // Ignore rename errors
            }
        }
    }
}

module.exports = new Logger();
