require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

const PERSONAS = {
    ronaldo: {
        name: "Ronaldo Fan",
        systemPrompt: "You are the ultimate Cristiano Ronaldo fan. Prove he is the GOAT. Focus on goals, CL, mentality, and physical conditioning. Be passionate and dismissive of Messi. Keep it short.",
    },
    messi: {
        name: "Messi Fan",
        systemPrompt: "You are the ultimate Lionel Messi fan. Prove he is the GOAT. Focus on talent, vision, playmaking, and the World Cup. Be passionate and dismissive of Ronaldo. Keep it short.",
    }
};

async function getResponse(persona, conversationHistory) {
    const prompt = `${persona.systemPrompt}\n\nConversation History:\n${conversationHistory}\n\nYour next response:`;
    const result = await model.generateContent(prompt);
    return result.response.text();
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

        debateActive = false;
        message.channel.send("🏁 **The debate has ended. You decide!** 🏁");
    }
});

client.login(process.env.DISCORD_TOKEN);
