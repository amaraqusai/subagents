require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

function loadPersona(name) {
    const filePath = path.join(__dirname, '.gemini', 'agents', `${name}.md`);
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
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

async function getResponse(persona, conversationHistory) {
    const prompt = `${persona.systemPrompt}\n\nConversation History:\n${conversationHistory}\n\nYour next response:`;
    const result = await model.generateContent(prompt);
    return result.response.text();
}

async function startDebate() {
    if (!process.env.GEMINI_API_KEY) {
        console.error("Error: GEMINI_API_KEY is not set in your .env file.");
        return;
    }

    let history = [];
    console.log("\n⚽ \x1b[1mThe GOAT Debate Starts Now!\x1b[0m ⚽\n");

    let currentPersona = 'ronaldo';
    for (let i = 0; i < 6; i++) {
        const persona = PERSONAS[currentPersona];
        process.stdout.write(`\x1b[33m\x1b[1m${persona.name}:\x1b[0m Thinking...`);
        
        const response = await getResponse(persona, history.join('\n'));
        
        // Clear "Thinking..." and print response
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        console.log(`\x1b[33m\x1b[1m${persona.name}:\x1b[0m ${response}\n`);
        
        history.push(`${persona.name}: ${response}`);
        currentPersona = currentPersona === 'ronaldo' ? 'messi' : 'ronaldo';
        
        // Wait 15 seconds between turns to stay under 5 RPM limit
        if (i < 5) {
            process.stdout.write(`\x1b[90mWaiting for quota (15s)...\x1b[0m`);
            await new Promise(resolve => setTimeout(resolve, 15000));
            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
        }
    }

    console.log("⚖️  \x1b[1mThe Referee is weighing the arguments...\x1b[0m ⚖️\n");
    
    // Final wait for the Referee
    process.stdout.write(`\x1b[90mPreparing verdict (15s)...\x1b[0m`);
    await new Promise(resolve => setTimeout(resolve, 15000));
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);

    const refereeResponse = await getResponse(PERSONAS.referee, history.join('\n') + "\n\nReferee, please declare the winner based on the debate above.");
    
    console.log(`\x1b[32m\x1b[1mThe Referee:\x1b[0m ${refereeResponse}\n`);
    console.log("🏁 \x1b[1mThe verdict is in!\x1b[0m 🏁\n");
}

startDebate();
