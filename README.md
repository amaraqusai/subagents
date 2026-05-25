# GOAT Debate Subagents & Discord Bot ⚽🐐

This project features two specialized Gemini CLI subagents—a **Ronaldo Fan** and a **Messi Fan**—and a Discord bot that orchestrates a multi-turn debate between them under the strict supervision of a **Referee (Judge)**.

## ⚖️ The Flow & Protocol

To ensure structured, high-fidelity communication and optimize token usage, this system implements the following patterns:

1. **Judge-Routed Communication (Child $\rightarrow$ Judge $\rightarrow$ Child):**
   The competing subagents (Ronaldo Fan and Messi Fan) do not communicate directly. Instead, all turns route through the Referee. The Referee moderates the debate, analyzes the arguments for bluffs or lies, logs score trackers, and prompts the next speaker.
   
   ```mermaid
   graph TD
       Ronaldo[Ronaldo Fan Subagent] -->|JSON Response| Ref[Referee / Judge]
       Ref -->|JSON Commentary & History| Messi[Messi Fan Subagent]
       Messi -->|JSON Response| Ref
       Ref -->|JSON Commentary & History| Ronaldo
   ```

2. **JSON Communication Protocol:**
   All communication between the processes and agents uses a structured JSON protocol. Models generate raw JSON blocks containing their internal thought processes, search grounding strategies, detected opponent lies, intentional bluffs, and their public arguments.

3. **Active Listening & Bluff/Lie Detection:**
   Subagents use the mandatory **Google Search grounding tool** to analyze the opponent's previous argument. If they detect a factual exaggeration or lie, they call it out explicitly with evidence. Subagents are also allowed to bluff or lie strategically.

---

## 🚀 Features

- **Referee Orchestrator:** Manages debate turns, scores successful bluffs/detections, and declares the winner.
- **Structured JSON Communication:** Clean message structure saving tokens and ensuring reliability.
- **Search Tool Grounding:** Both Ronaldo and Messi fans utilize Google Search to query real-time statistics and historical matches.
- **Discord & CLI Interfaces:** Full capability to run the debate directly in a Discord server or locally in your terminal.
- **Quotas & Retry Protection:** Built-in sleep delay and retry loops to handle Gemini API rate limits.

---

## 🛠️ Setup Instructions

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed.
- A Discord Bot Token (from the [Discord Developer Portal](https://discord.com/developers/applications)).
- A Google Gemini API Key (from [Google AI Studio](https://aistudio.google.com/)).

### 2. Installation
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

---

## 🎮 How to Run

### 1. Command-Line Interface (CLI)

You can run the live debate locally in your terminal. 

```bash
# Run with default 10 turns per side, 15-second delay, using gemini-2.5-flash
node debate-cli.js

# Customize the run parameters (turns, delay, model)
node debate-cli.js --turns 5 --delay 15 --model gemini-2.5-flash
```

#### CLI Parameters:
* `--turns` or `-t`: Number of turns (pings) per side (default: `10`).
* `--delay` or `-d`: Delay in seconds between API calls to prevent 429 rate limit exceptions (default: `15`).
* `--model` or `-m`: Gemini model to run (default: `gemini-2.5-flash`).

> [!NOTE]
> **Daily Quota & Budget Constraints**
> The Gemini API free tier restricts projects to **20 requests per day** for some flash models (like `gemini-2.5-flash`). If you have budget/quota constraints, you can lower the turns to **5 turns per side** (or fewer) by running:
> `node debate-cli.js --turns 3`
>
> Alternatively, you can run our **Mock Grounded Simulation** which tests the entire debate flow, JSON serialization, and lie detection without hitting the Gemini API:
> `node verify_debate_flow.js`

### 2. Discord Bot

Once the bot is online, type the following in any channel:
* `!debate`: Starts the default debate (10 turns per side, routed through the Referee).
* `!debate [turns]`: Starts a debate with a custom number of turns per side (e.g. `!debate 5` or `!debate 3`).

---

## 📂 Project Structure

- `.gemini/agents/`:
  - [ronaldo-fan.md](file:///c:/Users/USER/OneDrive/Desktop/subagents/.gemini/agents/ronaldo-fan.md): Cristiano Ronaldo fan persona prompt with JSON schema.
  - [messi-fan.md](file:///c:/Users/USER/OneDrive/Desktop/subagents/.gemini/agents/messi-fan.md): Lionel Messi fan persona prompt with JSON schema.
  - [referee.md](file:///c:/Users/USER/OneDrive/Desktop/subagents/.gemini/agents/referee.md): Debate Moderator / Judge persona prompt.
- [debate-cli.js](file:///c:/Users/USER/OneDrive/Desktop/subagents/debate-cli.js): Local terminal debate engine with search grounding, CLI arguments, and retry logic.
- [verify_debate_flow.js](file:///c:/Users/USER/OneDrive/Desktop/subagents/verify_debate_flow.js): Offline mock simulation verifying JSON schemas, lie detection, and routing.
- [index.js](file:///c:/Users/USER/OneDrive/Desktop/subagents/index.js): Discord bot server orchestrator.
- `TODO.md`: Roadmap and feature list.
- `package.json`: Node dependencies.
