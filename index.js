require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const logger = require('./logger');
const Gatekeeper = require('./gatekeeper');
const Watchdog = require('./watchdog');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

let genAI;
if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

const MODEL_NAME = "gemini-2.5-flash-lite"; // Default to 2.5-flash-lite to avoid daily 2.5-flash rate limits

function loadPersona(name) {
    const filePath = path.join(__dirname, '.gemini', 'agents', `${name}.md`);
    if (!fs.existsSync(filePath)) {
        logger.error('DiscordBot', `Persona file not found: ${filePath}`);
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

// Helper to initialize models with specific persona instruction and search grounding
function getAgentModel(persona, enableSearch = true) {
    if (!genAI) return null;
    return genAI.getGenerativeModel({
        model: MODEL_NAME,
        systemInstruction: persona.systemPrompt,
        tools: enableSearch ? [{ googleSearch: {} }] : []
    });
}

// Global components
const watchdog = new Watchdog(45000); // 45 second timeout for model requests
const gatekeeper = new Gatekeeper('gatekeeper_status.json', 0.50); // $0.50 budget limit

// Clean and parse model JSON response
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
            throw new Error(`JSON parsing failed: ${err.message}. Response: ${text.substring(0, 100)}...`);
        }
    }
}

// Call model with watchdog, gatekeeper, and retry logic to avoid rate limits
async function callModelWithRetry(model, prompt, maxRetries = 3) {
    let baseDelay = 15000;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            // Verify budget before making the call
            gatekeeper.checkBudget();

            // Run task under watchdog supervision
            const result = await watchdog.run('model-generation-discord', async () => {
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
            logger.warn('DiscordBot', `Attempt ${attempt}/${maxRetries} failed: ${err.message}`);
            if (attempt === maxRetries) {
                throw err;
            }
            const waitTime = baseDelay * attempt;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
}

// Format and extract search metadata for Discord output
function getSearchMetadataString(candidate) {
    const searchQueries = candidate?.groundingMetadata?.webSearchQueries;
    const chunks = candidate?.groundingMetadata?.groundingChunks;
    let metadataStr = "";
    
    if (searchQueries && searchQueries.length > 0) {
        metadataStr += `*🔍 Search query: "${searchQueries.join(', ')}"\n*`;
    }
    if (chunks && chunks.length > 0) {
        const domains = [...new Set(chunks.map(c => {
            try {
                return new URL(c.web?.uri || '').hostname.replace('www.', '');
            } catch (e) {
                return c.web?.title || 'Web Search';
            }
        }))];
        metadataStr += `*📚 Sources: ${domains.join(', ')}*`;
    }
    return metadataStr;
}

let debateActive = false;

client.once('ready', () => {
    logger.info('DiscordBot', `Discord bot logged in as ${client.user.tag}!`);
    console.log(`Discord bot logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const parts = message.content.trim().split(/\s+/);
    if (parts[0] === '!debate') {
        if (debateActive) {
            return message.reply("⚠️ A debate is already in progress!");
        }

        // Allow user to specify turns, default to 10
        let turns = parseInt(parts[1], 10) || 10;
        if (turns < 1) turns = 1;
        if (turns > 15) {
            message.reply("⚠️ Debates are capped at 15 turns per side to prevent API limits. Running 15 turns.");
            turns = 15;
        }

        debateActive = true;
        const debateHistory = [];
        let lastSpeaker = null;
        let lastResponse = null;
        let opponentDetectedLies = [];

        logger.info('DiscordBot', 'Starting Discord GOAT debate', { turns, channelId: message.channel.id });

        await message.channel.send(`⚽ **The GOAT Debate Starts Now!** ⚽\n*Flow: Child $\\rightarrow$ Judge $\\rightarrow$ Child*\n*Duration: ${turns} turns per side | Model: ${MODEL_NAME}*`);

        const ronaldoModel = getAgentModel(PERSONAS.ronaldo, true);
        const messiModel = getAgentModel(PERSONAS.messi, true);
        const refereeModel = getAgentModel(PERSONAS.referee, true);

        try {
            // Referee starts the debate
            await message.channel.sendTyping();
            const refereeStartPrompt = JSON.stringify({
                last_speaker: null,
                last_response: null,
                opponent_detected_lies: [],
                debate_history: []
            });

            const refStartResult = await callModelWithRetry(refereeModel, refereeStartPrompt);
            const refereeData = refStartResult.parsed;

            await message.channel.send(`⚖️ **The Referee:** ${refereeData.referee_commentary}`);
            debateHistory.push({ speaker: "Referee", argument: refereeData.referee_commentary });

            let currentSpeaker = refereeData.next_speaker || 'ronaldo-fan';

            // Each side gets `turns` pings. Total turns = turns * 2.
            for (let turn = 1; turn <= turns * 2; turn++) {
                // Wait 15 seconds to prevent rate limit issues
                await new Promise(resolve => setTimeout(resolve, 15000));
                await message.channel.sendTyping();

                const isRonaldo = currentSpeaker === 'ronaldo-fan' || currentSpeaker === 'ronaldo';
                const speakerName = isRonaldo ? PERSONAS.ronaldo.name : PERSONAS.messi.name;
                const speakerModel = isRonaldo ? ronaldoModel : messiModel;
                const speakerEmoji = isRonaldo ? "🇵🇹" : "🇦🇷";

                const childPrompt = JSON.stringify({
                    referee_instructions: debateHistory[debateHistory.length - 1].argument,
                    opponent_argument: lastResponse ? lastResponse.argument : "",
                    debate_history: debateHistory
                });

                const childResult = await callModelWithRetry(speakerModel, childPrompt);
                const childData = childResult.parsed;

                // Send response message to Discord channel
                let replyContent = `**${speakerEmoji} ${speakerName}:** ${childData.argument}`;
                const searchMetadata = getSearchMetadataString(childResult.candidate);
                if (searchMetadata) {
                    replyContent += `\n${searchMetadata}`;
                }

                await message.channel.send(replyContent);

                // Record history
                debateHistory.push({ speaker: speakerName, argument: childData.argument });

                lastSpeaker = isRonaldo ? 'ronaldo-fan' : 'messi-fan';
                lastResponse = childData;
                opponentDetectedLies = childData.lies_or_bluffs_detected || [];

                // Moderate turn by routing to Referee
                await new Promise(resolve => setTimeout(resolve, 15000));
                await message.channel.sendTyping();

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

                let refereeReply = `⚖️ **The Referee:** ${refData.referee_commentary}`;
                if (refData.internal_notes?.analysis_of_last_turn) {
                    refereeReply += `\n*(Referee Notes: ${refData.internal_notes.analysis_of_last_turn})*`;
                }

                await message.channel.send(refereeReply);
                debateHistory.push({ speaker: "Referee", argument: refData.referee_commentary });
                
                currentSpeaker = refData.next_speaker || (isRonaldo ? 'messi-fan' : 'ronaldo-fan');
            }

            // Final Verdict
            await new Promise(resolve => setTimeout(resolve, 15000));
            await message.channel.sendTyping();
            await message.channel.send("⚖️ **The Referee is preparing the Final Verdict...** ⚖️");

            const finalVerdictPrompt = `The debate of ${turns} turns per side is complete. Please analyze the debate history, evaluate who made a stronger case, consider if they successfully detected each other's lies/bluffs, and declare a winner. Respond ONLY with the final verdict JSON.`;

            const finalResult = await callModelWithRetry(refereeModel, finalVerdictPrompt);
            const finalData = finalResult.parsed;

            let verdictMsg = `🏆 **THE FINAL VERDICT** 🏆\n\n`;
            verdictMsg += `🥇 **Winner:** **${finalData.winner}**\n\n`;
            verdictMsg += `📝 **Explanation:** ${finalData.verdict_explanation}\n\n`;
            
            verdictMsg += `📊 **Ronaldo Fan Key Points:**\n`;
            finalData.summary_of_arguments?.ronaldo_fan_key_points?.forEach(p => {
                verdictMsg += `• ${p}\n`;
            });

            verdictMsg += `\n📊 **Messi Fan Key Points:**\n`;
            finalData.summary_of_arguments?.messi_fan_key_points?.forEach(p => {
                verdictMsg += `• ${p}\n`;
            });

            verdictMsg += `\n🔍 **Bluff & Detection Summary:**\n`;
            verdictMsg += `• Ronaldo Fan: ${finalData.bluff_detection_summary?.ronaldo_fan_bluffs_detected}\n`;
            verdictMsg += `• Messi Fan: ${finalData.bluff_detection_summary?.messi_fan_bluffs_detected}\n`;

            await message.channel.send(verdictMsg);
            await message.channel.send("🏁 **The Debate has officially closed!** 🏁");

            logger.info('DiscordBot', 'Discord debate completed successfully', { winner: finalData.winner });

        } catch (err) {
            logger.error('DiscordBot', `Error during Discord debate orchestration: ${err.message}`);
            await message.channel.send(`❌ **Orchestration Error:** ${err.message}. The debate has been aborted.`);
        } finally {
            debateActive = false;
        }
    }
});

if (require.main === module) {
    client.login(process.env.DISCORD_TOKEN).catch(err => {
        logger.error('DiscordBot', `Failed to login to Discord: ${err.message}`);
        console.error("Failed to login to Discord:", err.message);
    });
}
