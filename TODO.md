# 📝 Project TODO List

## High Priority
- [x] **Switch to Free Tier:** Changed model to `gemini-2.5-flash` for free tier usage.
- [ ] **Dynamic Debate Length:** Allow users to specify the number of turns (e.g., `!debate 10`).
- [ ] **Agent Personalities:** Add more fans (e.g., Neymar, Mbappé, or Pelé fans).
- [ ] **Error Handling:** Add better error logging for API failures or Discord connection issues.

## Features to Add
- [ ] **Winner Voting:** Add Discord reactions at the end of a debate so users can vote on who won.
- [ ] **Live Score Integration:** Let the agents reference real-time match stats if a game is happening.
- [ ] **Voice Support:** Use Text-to-Speech (TTS) to have the agents "speak" in a voice channel.

## Refactoring
- [x] **Modularize Personas:** Move persona definitions in `index.js` to external JSON or Markdown files for easier editing. (Completed with Referee integration)
- [ ] **TypeScript Conversion:** Rewrite the bot in TypeScript for better type safety and maintainability.
