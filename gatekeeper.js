const fs = require('fs');
const path = require('path');
const logger = require('./logger');

class Gatekeeper {
    constructor(statusFile = 'gatekeeper_status.json', budgetLimitUSD = 0.50) {
        this.statusFile = path.resolve(statusFile);
        this.budgetLimitUSD = budgetLimitUSD;
        
        // Approximate costs per 1M tokens for gemini-2.5-flash:
        // Input: $0.075 / 1M ($0.000000075 / token)
        // Output: $0.30 / 1M ($0.0000003 / token)
        this.costPerInputToken = 0.075 / 1000000;
        this.costPerOutputToken = 0.30 / 1000000;

        this.loadStatus();
    }

    loadStatus() {
        if (fs.existsSync(this.statusFile)) {
            try {
                const data = JSON.parse(fs.readFileSync(this.statusFile, 'utf8'));
                this.promptTokens = data.promptTokens || 0;
                this.candidatesTokens = data.candidatesTokens || 0;
                this.totalTokens = data.totalTokens || 0;
                this.estimatedCostUSD = data.estimatedCostUSD || 0;
                // Budget limit can also be read from status or overridden
                this.budgetLimitUSD = data.budgetLimitUSD !== undefined ? data.budgetLimitUSD : this.budgetLimitUSD;
            } catch (e) {
                this.resetStatus();
            }
        } else {
            this.resetStatus();
        }
    }

    resetStatus() {
        this.promptTokens = 0;
        this.candidatesTokens = 0;
        this.totalTokens = 0;
        this.estimatedCostUSD = 0;
        this.saveStatus();
        logger.info('Gatekeeper', 'Gatekeeper budget status reset.');
    }

    saveStatus() {
        const data = {
            promptTokens: this.promptTokens,
            candidatesTokens: this.candidatesTokens,
            totalTokens: this.totalTokens,
            estimatedCostUSD: this.estimatedCostUSD,
            budgetLimitUSD: this.budgetLimitUSD
        };
        try {
            fs.writeFileSync(this.statusFile, JSON.stringify(data, null, 2), 'utf8');
        } catch (e) {
            // Ignore write errors in concurrent test conditions
        }
    }

    recordUsage(usageMetadata) {
        this.loadStatus();
        this.checkBudget();

        if (!usageMetadata) return;

        const input = usageMetadata.promptTokenCount || 0;
        const output = usageMetadata.candidatesTokenCount || 0;
        const total = usageMetadata.totalTokenCount || (input + output);

        const addedCost = (input * this.costPerInputToken) + (output * this.costPerOutputToken);

        this.promptTokens += input;
        this.candidatesTokens += output;
        this.totalTokens += total;
        this.estimatedCostUSD += addedCost;

        this.saveStatus();

        logger.info('Gatekeeper', 'Recorded token usage', {
            addedInput: input,
            addedOutput: output,
            addedCost: addedCost.toFixed(6),
            totalCost: this.estimatedCostUSD.toFixed(6)
        });

        this.checkBudget();
    }

    checkBudget() {
        if (this.estimatedCostUSD >= this.budgetLimitUSD) {
            const errorMsg = `Gatekeeper: Economic budget limit reached ($${this.estimatedCostUSD.toFixed(4)} >= $${this.budgetLimitUSD.toFixed(4)}). Blocking further requests.`;
            logger.error('Gatekeeper', errorMsg);
            throw new Error(errorMsg);
        }
    }
}

module.exports = Gatekeeper;
