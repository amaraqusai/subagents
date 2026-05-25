# GOAT Debate Subagents & Discord Bot ⚽🐐

This project features two specialized Gemini CLI subagents—a **Ronaldo Fan** and a **Messi Fan**—and a Discord bot that allows them to debate who is the Greatest of All Time (GOAT) directly in your server.

## 🚀 Features

- **Custom Subagents:** Dedicated personas for Ronaldo and Messi fans with distinct arguments and styles.
- **Discord Integration:** A bot that orchestrates a multi-turn debate between the two fans using the `!debate` command.
- **Powered by Gemini:** Uses Google's Gemini 1.5 Flash for fast, intelligent, and punchy responses.

## 🛠️ Setup Instructions

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed.
- [Gemini CLI](https://github.com/google/gemini-cli) (optional, for CLI subagent use).
- A Discord Bot Token (from the [Discord Developer Portal](https://discord.com/developers/applications)).
- A Google Gemini API Key (from [Google AI Studio](https://aistudio.google.com/)).

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/amaraqusai/subagents.git
cd subagents
npm install
```

### 3. Configuration
Create a `.env` file in the root directory:
```env
DISCORD_TOKEN=your_discord_bot_token_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Running the Bot
```bash
node index.js
```

## 🎮 How to Use

### In Discord
Once the bot is online, type the following in any channel:
- `!debate`: Starts a back-and-forth debate between the Ronaldo and Messi fans (at least 5 pings per side).

### In Gemini CLI
If you have the Gemini CLI installed, you can interact with the personas directly:
- `gemini @ronaldo-fan "Why is Ronaldo better than Messi?"`
- `gemini @messi-fan "What makes Messi the GOAT?"`

## 📂 Project Structure
- `.gemini/agents/`: Contains the subagent persona definitions.
- `index.js`: The main Discord bot logic and persona orchestration.
- `.env.example`: Template for environment variables.
- `TODO.md`: Future improvements and roadmap.
