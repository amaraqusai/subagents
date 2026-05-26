require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const logger = require('./logger');
const Gatekeeper = require('./gatekeeper');
const Watchdog = require('./watchdog');
const { showTerminalMenu } = require('./menu');

// CLI Arguments parsing
const args = process.argv.slice(2);
let turns = 10; // Default 10 turns per side
let delaySeconds = 15; // Default 15s delay to prevent quota issues
let selectedModel = "gemini-2.5-flash-lite"; // Default to 2.5-flash-lite to avoid daily 2.5-flash rate limits

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--turns' || args[i] === '-t') {
        turns = parseInt(args[i+1], 10) || 10;
        i++;
    } else if (args[i] === '--delay' || args[i] === '-d') {
        delaySeconds = parseInt(args[i+1], 10) || 15;
        i++;
    } else if (args[i] === '--model' || args[i] === '-m') {
        selectedModel = args[i+1] || "gemini-2.5-flash";
        i++;
    }
}

let genAI;
if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Load agent persona configurations
function loadPersona(name) {
    const filePath = path.join(__dirname, '.gemini', 'agents', `${name}.md`);
    if (!fs.existsSync(filePath)) {
        logger.error('CLI', `Persona file not found: ${filePath}`);
        console.error(`\x1b[31m[Error] Persona file not found: ${filePath}\x1b[0m`);
        process.exit(1);
    }
    const content = fs.readFileSync(filePath, 'utf8');
    
    const match = content.match(/---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)/);
    if (!match) return { name: name, systemPrompt: content };

    const body = match[2].trim();
    const frontmatter = match[1];
    const nameMatch = frontmatter.match(/name:\s*(.*)/);
    const displayName = nameMatch ? nameMatch[1].trim() : name;

    return {
        name: displayName,
        systemPrompt: body
    };
}

const PERSONAS = {
    ronaldo: loadPersona('ronaldo-fan'),
    messi: loadPersona('messi-fan'),
    referee: loadPersona('referee')
};

// Initialize Gemini models with appropriate system instruction and search grounding
function getAgentModel(persona, enableSearch = true) {
    if (!genAI) return null;
    return genAI.getGenerativeModel({
        model: selectedModel,
        systemInstruction: persona.systemPrompt,
        tools: enableSearch ? [{ googleSearch: {} }] : []
    });
}

// TTY-Safe Console Utilities to prevent crashes in non-interactive environments
function clearConsoleLine() {
    if (process.stdout.isTTY && typeof process.stdout.clearLine === 'function') {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
    } else {
        process.stdout.write('\n');
    }
}

// Global components
const watchdog = new Watchdog(45000); // 45 second timeout for model requests
const gatekeeper = new Gatekeeper('gatekeeper_status.json', 0.50); // $0.50 budget limit

// Robust JSON extraction and parsing
function parseModelJson(text) {
    try {
        const startIdx = text.indexOf("{");
        const endIdx = text.lastIndexOf("}");
        if (startIdx === -1 || endIdx === -1) {
            throw new Error("No JSON object characters found");
        }
        const jsonStr = text.substring(startIdx, endIdx + 1);
        return JSON.parse(jsonStr);
    } catch (err) {
        // Fallback: strip markdown blocks
        let cleaned = text.replace(/```json|```/g, '').trim();
        try {
            return JSON.parse(cleaned);
        } catch (innerErr) {
            throw new Error(`JSON parsing failed: ${err.message}. Original text: ${text.substring(0, 150)}...`);
        }
    }
}

// Call model with watchdog, gatekeeper, and retry mechanisms
async function callModelWithRetry(model, prompt, maxRetries = 3) {
    let baseDelay = 15000;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            // Verify budget before making the call
            gatekeeper.checkBudget();

            // Run task under watchdog supervision
            const result = await watchdog.run('model-generation', async () => {
                const response = await model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }]
                });
                return response;
            });

            const text = result.response.text();
            
            // Validate JSON structure
            const parsed = parseModelJson(text);

            // Record token consumption securely in the gatekeeper
            gatekeeper.recordUsage(result.response.usageMetadata);

            return { parsed, text, candidate: result.response.candidates?.[0] };
        } catch (err) {
            logger.warn('CLI', `Attempt ${attempt}/${maxRetries} failed: ${err.message}`);
            console.warn(`\n\x1b[33m[Warning] Attempt ${attempt}/${maxRetries} failed: ${err.message}\x1b[0m`);
            if (attempt === maxRetries) {
                throw err;
            }
            const waitTime = baseDelay * attempt;
            console.log(`\x1b[90mWaiting ${waitTime / 1000}s before retrying...\x1b[0m`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
}

// Print grounding search query and sources if available
function printGroundingInfo(candidate) {
    const searchQueries = candidate?.groundingMetadata?.webSearchQueries;
    const chunks = candidate?.groundingMetadata?.groundingChunks;
    if (searchQueries && searchQueries.length > 0) {
        console.log(`  \x1b[90m🔍 Search Query: "${searchQueries.join(', ')}"\x1b[0m`);
    }
    if (chunks && chunks.length > 0) {
        const domains = [...new Set(chunks.map(c => {
            try {
                return new URL(c.web?.uri || '').hostname.replace('www.', '');
            } catch (e) {
                return c.web?.title || 'Web Search';
            }
        }))];
        console.log(`  \x1b[90m📚 Sources: ${domains.join(', ')}\x1b[0m`);
    }
}

async function startDebate() {
    if (!process.env.GEMINI_API_KEY) {
        console.error("\x1b[31m[Error] GEMINI_API_KEY is not set in your .env file.\x1b[0m");
        return;
    }

    const ronaldoModel = getAgentModel(PERSONAS.ronaldo, true);
    const messiModel = getAgentModel(PERSONAS.messi, true);
    const refereeModel = getAgentModel(PERSONAS.referee, true);

    logger.info('CLI', 'Starting live GOAT debate', { turns, model: selectedModel });

    console.log("\n========================================================");
    console.log("⚽ \x1b[1m\x1b[32mThe GOAT Debate Starts Now! (Judge Routing & JSON Protocol)\x1b[0m ⚽");
    console.log(`  Turns: ${turns} per side | Model: ${selectedModel} | Delay: ${delaySeconds}s`);
    console.log("========================================================\n");

    const debateHistory = [];
    let lastSpeaker = null;
    let lastResponse = null;
    let opponentDetectedLies = [];
    
    // Referee starts the debate
    console.log(`\x1b[36m\x1b[1mReferee:\x1b[0m Thinking...`);
    const refereeStartPrompt = JSON.stringify({
        last_speaker: null,
        last_response: null,
        opponent_detected_lies: [],
        debate_history: []
    });

    const refStartResult = await callModelWithRetry(refereeModel, refereeStartPrompt);
    const refereeData = refStartResult.parsed;
    
    console.log(`\x1b[36m\x1b[1mThe Referee:\x1b[0m ${refereeData.referee_commentary}\n`);
    debateHistory.push({ speaker: "Referee", argument: refereeData.referee_commentary });

    let currentSpeaker = refereeData.next_speaker || 'ronaldo-fan';

    for (let turn = 1; turn <= turns * 2; turn++) {
        // Delay between turns to protect rate limits
        process.stdout.write(`\x1b[90mWaiting for quota (${delaySeconds}s)...\x1b[0m`);
        await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
        clearConsoleLine();

        const isRonaldo = currentSpeaker === 'ronaldo-fan' || currentSpeaker === 'ronaldo';
        const speakerName = isRonaldo ? PERSONAS.ronaldo.name : PERSONAS.messi.name;
        const speakerModel = isRonaldo ? ronaldoModel : messiModel;
        const color = isRonaldo ? '\x1b[33m' : '\x1b[35m';

        console.log(`${color}\x1b[1m${speakerName}:\x1b[0m Thinking...`);

        // Format prompt for child agent
        const childPrompt = JSON.stringify({
            referee_instructions: debateHistory[debateHistory.length - 1].argument,
            opponent_argument: lastResponse ? lastResponse.argument : "",
            debate_history: debateHistory
        });

        const childResult = await callModelWithRetry(speakerModel, childPrompt);
        const childData = childResult.parsed;

        // Clear thinking line and print argument
        clearConsoleLine();
        console.log(`${color}\x1b[1m${speakerName}:\x1b[0m ${childData.argument}`);
        printGroundingInfo(childResult.candidate);
        console.log();

        // Check if they tried to bluff/lie
        if (childData.intent_to_bluff_or_lie) {
            console.log(`  \x1b[90m⚡ [Developer Trace] ${speakerName} is BLUFFING/LYING: "${childData.bluff_or_lie_details}"\x1b[0m\n`);
        }

        // Record history
        debateHistory.push({ speaker: speakerName, argument: childData.argument });
        
        lastSpeaker = isRonaldo ? 'ronaldo-fan' : 'messi-fan';
        lastResponse = childData;
        opponentDetectedLies = childData.lies_or_bluffs_detected || [];

        // Route to the Referee (Judge)
        process.stdout.write(`\x1b[90mReferee is analyzing the turn (${delaySeconds}s)...\x1b[0m`);
        await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
        clearConsoleLine();

        console.log(`\x1b[36m\x1b[1mReferee:\x1b[0m Evaluating...`);

        const refereePrompt = JSON.stringify({
            last_speaker: lastSpeaker,
            last_response: {
                argument: lastResponse.argument,
                intent_to_bluff_or_lie: lastResponse.intent_to_bluff_or_lie,
                bluff_or_lie_details: lastResponse.bluff_or_lie_details
            },
            opponent_detected_lies: opponentDetectedLies,
            debate_history: debateHistory
        });

        const refResult = await callModelWithRetry(refereeModel, refereePrompt);
        const refData = refResult.parsed;

        clearConsoleLine();
        console.log(`\x1b[36m\x1b[1mThe Referee:\x1b[0m ${refData.referee_commentary}`);
        if (refData.internal_notes?.analysis_of_last_turn) {
            console.log(`  \x1b[90m📋 [Referee Notes] ${refData.internal_notes.analysis_of_last_turn}\x1b[0m`);
        }
        console.log();

        debateHistory.push({ speaker: "Referee", argument: refData.referee_commentary });
        currentSpeaker = refData.next_speaker || (isRonaldo ? 'messi-fan' : 'ronaldo-fan');
    }

    // Debate finished. Referee issues Final Verdict.
    process.stdout.write(`\x1b[90mPreparing final verdict (${delaySeconds}s)...\x1b[0m`);
    await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
    clearConsoleLine();

    console.log(`\x1b[36m\x1b[1mReferee:\x1b[0m Writing final verdict...`);

    const finalVerdictPrompt = `The debate of ${turns} turns per side is complete. Please analyze the debate history, evaluate who made a stronger case, consider if they successfully detected each other's lies/bluffs, and declare a winner. Respond ONLY with the final verdict JSON.`;

    const finalResult = await callModelWithRetry(refereeModel, finalVerdictPrompt);
    const finalData = finalResult.parsed;

    clearConsoleLine();
    
    console.log("\n========================================================");
    console.log("⚖️  \x1b[1m\x1b[32mTHE REFEREE'S FINAL VERDICT\x1b[0m ⚖️");
    console.log("========================================================\n");
    
    console.log(`\x1b[1mWinner:\x1b[0m \x1b[32m\x1b[1m${finalData.winner}\x1b[0m`);
    console.log(`\x1b[1mExplanation:\x1b[0m ${finalData.verdict_explanation}\n`);
    
    console.log("\x1b[1mSummary of Ronaldo Fan Key Points:\x1b[0m");
    finalData.summary_of_arguments?.ronaldo_fan_key_points?.forEach(p => console.log(` - ${p}`));
    
    console.log("\n\x1b[1mSummary of Messi Fan Key Points:\x1b[0m");
    finalData.summary_of_arguments?.messi_fan_key_points?.forEach(p => console.log(` - ${p}`));
    
    console.log("\n\x1b[1mBluff & Lie Detection Summary:\x1b[0m");
    console.log(` Ronaldo Fan: ${finalData.bluff_detection_summary?.ronaldo_fan_bluffs_detected}`);
    console.log(` Messi Fan:   ${finalData.bluff_detection_summary?.messi_fan_bluffs_detected}`);
    
    console.log("\n========================================================");
    console.log("🏁 \x1b[1mDebate Closed!\x1b[0m 🏁");
    console.log("========================================================\n");

    logger.info('CLI', 'Live GOAT debate finished successfully', { winner: finalData.winner });
}

function showMenuAndRun() {
    const options = [
        "1. Run Live Debate (Gemini API)",
        "2. Run Mock-grounded Simulation (Offline)",
        "3. View Gatekeeper Token & Cost Status",
        "4. Run Unit Tests (TDD)",
        "5. Reset Gatekeeper Budget",
        "6. Exit"
    ];

    showTerminalMenu("GOAT DEBATE SYSTEM MENU", options, async (selection) => {
        if (selection === 0) {
            console.clear();
            await startDebate().catch(err => {
                logger.error('CLI', 'Fatal error during debate', { error: err.message });
                console.error("\x1b[31mFatal Error during debate:\x1b[0m", err);
            });
            console.log("\nPress Enter to return to menu...");
            process.stdin.once('data', () => showMenuAndRun());
        } else if (selection === 1) {
            console.clear();
            try {
                // Remove cached module so we can run it multiple times in the same session
                delete require.cache[require.resolve('./verify_debate_flow')];
                require('./verify_debate_flow');
            } catch (e) {
                console.error("Error running mock simulation:", e.message);
            }
            console.log("\nPress Enter to return to menu...");
            process.stdin.once('data', () => showMenuAndRun());
        } else if (selection === 2) {
            console.clear();
            const gk = new Gatekeeper();
            console.log("\n========================================================");
            console.log("💰 GATEKEEPER BUDGET STATUS 💰");
            console.log("========================================================\n");
            console.log(`Prompt Tokens:      ${gk.promptTokens}`);
            console.log(`Candidates Tokens:  ${gk.candidatesTokens}`);
            console.log(`Total Tokens:       ${gk.totalTokens}`);
            console.log(`Estimated Cost:     $${gk.estimatedCostUSD.toFixed(6)}`);
            console.log(`Budget Limit:       $${gk.budgetLimitUSD.toFixed(4)}`);
            console.log(`Status:             ${gk.estimatedCostUSD >= gk.budgetLimitUSD ? "\x1b[31mEXCEEDED (BLOCKED)\x1b[0m" : "\x1b[32mOK\x1b[0m"}`);
            console.log("\n========================================================");
            console.log("\nPress Enter to return to menu...");
            process.stdin.once('data', () => showMenuAndRun());
        } else if (selection === 3) {
            console.clear();
            console.log("Running npm test...\n");
            const { execSync } = require('child_process');
            try {
                execSync('npm test', { stdio: 'inherit' });
            } catch (e) {
                console.error("Some tests failed.");
            }
            console.log("\nPress Enter to return to menu...");
            process.stdin.once('data', () => showMenuAndRun());
        } else if (selection === 4) {
            console.clear();
            const gk = new Gatekeeper();
            gk.resetStatus();
            console.log("Gatekeeper budget statistics reset to 0.");
            console.log("\nPress Enter to return to menu...");
            process.stdin.once('data', () => showMenuAndRun());
        } else if (selection === 5) {
            console.log("Goodbye!");
            process.exit(0);
        }
    });
}

// Run menu if executed directly from CLI
if (require.main === module) {
    showMenuAndRun();
}
