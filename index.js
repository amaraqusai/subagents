require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL_NAME = "gemini-2.5-flash";
let model;

try {
    model = genAI.getGenerativeModel({ model: MODEL_NAME });
    console.log(`Model initialized: ${MODEL_NAME}`);
} catch (err) {
    console.error(`Failed to initialize model ${MODEL_NAME}:`, err.message);
}

function loadPersona(name) {
    const filePath = path.join(__dirname, '.gemini', 'agents', `${name}.md`);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Simple parser for the markdown format
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

async function getResponse(persona, conversationHistory) {
    try {
        const prompt = `${persona.systemPrompt}\n\nConversation History:\n${conversationHistory}\n\nYour next response:`;
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (err) {
        console.error("Error getting response:", err.message);
        return "Sorry, I'm having trouble thinking right now. (API Error)";
    }
}

let debateActive = false;
let history = [];

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content === '!debate') {
        if (debateActive) {
            return message.reply("A debate is already in progress!");
        }

        debateActive = true;
        history = [];
        message.channel.send("⚽ **The GOAT Debate Starts Now!** ⚽");

        // Start the debate
        let currentPersona = 'ronaldo';
        for (let i = 0; i < 6; i++) {
            const persona = PERSONAS[currentPersona];
            const response = await getResponse(persona, history.join('\n'));
            
            await message.channel.send(`**${persona.name}:** ${response}`);
            history.push(`${persona.name}: ${response}`);
            
            // Switch persona
            currentPersona = currentPersona === 'ronaldo' ? 'messi' : 'ronaldo';
            
            // Small delay for realism
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Final verdict from the referee
        message.channel.send("⚖️ **The Referee is weighing the arguments...** ⚖️");
        const refereeResponse = await getResponse(PERSONAS.referee, history.join('\n') + "\n\nReferee, please declare the winner based on the debate above.");
        await message.channel.send(`**The Referee:** ${refereeResponse}`);

        debateActive = false;
        message.channel.send("🏁 **The verdict is in!** 🏁");
    }
});

client.login(process.env.DISCORD_TOKEN).catch(err => {
    console.error("Failed to login to Discord:", err.message);
    process.exit(1);
});
