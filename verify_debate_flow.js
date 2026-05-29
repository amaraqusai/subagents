// Mock Verification of the GOAT Debate Orchestration Engine
// This script simulates the models to test the JSON protocol, routing, and turn limits.

const { MOCK_ARGUMENTS, MOCK_REFEREE_COMMENTS, FINAL_VERDICT_DATA } = require('./lib/mock/mock-turns');

function runMockDebate(turnsPerSide) {
    console.log("\n========================================================\n" +
                `🧪 [TEST RUN] Simulating GOAT Debate Orchestration\n  Turns per side: ${turnsPerSide} | Total Turns: ${turnsPerSide * 2}\n` +
                "========================================================\n");

    const debateHistory = [];
    let lastResponse = null, opponentDetectedLies = [], ronaldoIndex = 0, messiIndex = 0, currentSpeaker = 'ronaldo-fan';

    const refStartCommentary = "Welcome to the ultimate GOAT debate! We have the Messi Fan and the Ronaldo Fan ready to clash. Ronaldo Fan, you have the floor. Tell us why Cristiano Ronaldo is the undisputed Greatest of All Time!";
    console.log(`\x1b[36m\x1b[1mThe Referee:\x1b[0m ${refStartCommentary}\n`);
    debateHistory.push({ speaker: "Referee", argument: refStartCommentary });

    for (let turn = 1; turn <= turnsPerSide * 2; turn++) {
        const isRonaldo = currentSpeaker === 'ronaldo-fan';
        const speakerName = isRonaldo ? "Cristiano Ronaldo Fan" : "Lionel Messi Fan";
        const color = isRonaldo ? '\x1b[33m' : '\x1b[35m';

        let data;
        if (isRonaldo) {
            const idx = ronaldoIndex % MOCK_ARGUMENTS['ronaldo-fan'].length;
            const item = MOCK_ARGUMENTS['ronaldo-fan'][idx];
            const detected = [];
            if (lastResponse && lastResponse.intent_to_bluff_or_lie) {
                detected.push({ opponent_claim: lastResponse.argument.substring(0, 50) + "...", reason_it_is_untrue: "Mock verification detected a contradiction.", evidence: "Search grounding confirmed facts." });
            }
            data = {
                thought_process: { opponent_analysis: `Analyzing Messi fan's claim: ${lastResponse ? lastResponse.argument : "None"}`, search_strategy: `Running web search: ${item.search_query}`, key_points: ["Ronaldo's records"] },
                search_query: item.search_query, lies_or_bluffs_detected: detected, argument: item.argument, intent_to_bluff_or_lie: item.intent_to_bluff_or_lie, bluff_or_lie_details: item.bluff_or_lie_details
            };
            ronaldoIndex++;
        } else {
            const idx = messiIndex % MOCK_ARGUMENTS['messi-fan'].length;
            const item = MOCK_ARGUMENTS['messi-fan'][idx];
            const detected = [];
            if (lastResponse && lastResponse.intent_to_bluff_or_lie) {
                if (lastResponse.bluff_or_lie_details.includes("Olympic")) {
                    detected.push({ opponent_claim: "Ronaldo won a major international trophy before Messi ever did", reason_it_is_untrue: "Messi won Olympic Gold in 2008 with Argentina, which is an international trophy.", evidence: "Lionel Messi won Gold with Argentina at the 2008 Beijing Olympics." });
                } else if (lastResponse.bluff_or_lie_details.includes("penalty")) {
                    detected.push({ opponent_claim: "Ronaldo's goals are all earned (no penalties)", reason_it_is_untrue: "Ronaldo has scored over 160 career penalties, which is the most in football history.", evidence: "Cristiano Ronaldo is the all-time leader in penalty goals scored." });
                } else {
                    detected.push({ opponent_claim: lastResponse.argument.substring(0, 50) + "...", reason_it_is_untrue: "Exaggerated claim.", evidence: "Verified stats via search." });
                }
            }
            data = {
                thought_process: { opponent_analysis: `Analyzing Ronaldo fan's claim: ${lastResponse ? lastResponse.argument : "None"}`, search_strategy: `Running web search: ${item.search_query}`, key_points: ["Messi's stats"] },
                search_query: item.search_query, lies_or_bluffs_detected: detected, argument: item.argument, intent_to_bluff_or_lie: item.intent_to_bluff_or_lie, bluff_or_lie_details: item.bluff_or_lie_details
            };
            messiIndex++;
        }

        console.log(`${color}\x1b[1m${speakerName}:\x1b[0m ${data.argument}\n  \x1b[90m🔍 Search Query: "${data.search_query}"\x1b[0m\n  \x1b[90m📚 Sources: transfermarkt.com, wikipedia.org\x1b[0m`);
        if (data.intent_to_bluff_or_lie) console.log(`  \x1b[90m⚡ [Developer Trace] ${speakerName} is BLUFFING/LYING: "${data.bluff_or_lie_details}"\x1b[0m`);
        if (data.lies_or_bluffs_detected.length > 0) {
            console.log(`  \x1b[31m🎯 [LIES DETECTED BY OPPONENT]:\x1b[0m`);
            data.lies_or_bluffs_detected.forEach(l => console.log(`    - Claim: "${l.opponent_claim}"\n      Why Untrue: ${l.reason_it_is_untrue}\n      Evidence: ${l.evidence}`));
        }
        console.log();

        debateHistory.push({ speaker: speakerName, argument: data.argument });
        lastResponse = data;
        opponentDetectedLies = data.lies_or_bluffs_detected;

        const refCommentary = MOCK_REFEREE_COMMENTS[(turn - 1) % MOCK_REFEREE_COMMENTS.length];
        let refAnalysis = "The argument was factually supported.";
        if (lastResponse.intent_to_bluff_or_lie) refAnalysis = `The speaker attempted a bluff: "${lastResponse.bluff_or_lie_details}". Let's see if the opponent catches it in the next turn.`;
        if (opponentDetectedLies.length > 0) refAnalysis = `The opponent successfully caught the bluff about "${opponentDetectedLies[0].opponent_claim}". Great analysis!`;

        console.log(`\x1b[36m\x1b[1mThe Referee:\x1b[0m ${refCommentary}\n  \x1b[90m📋 [Referee Notes] ${refAnalysis}\x1b[0m\n`);
        debateHistory.push({ speaker: "Referee", argument: refCommentary });
        currentSpeaker = isRonaldo ? 'messi-fan' : 'ronaldo-fan';
    }

    console.log("\n========================================================\n⚖️  THE REFEREE'S FINAL VERDICT (MOCK ANALYSIS)\n========================================================\n");
    console.log(`\x1b[1mWinner:\x1b[0m \x1b[32m\x1b[1m${FINAL_VERDICT_DATA.winner}\x1b[0m\n\x1b[1mExplanation:\x1b[0m ${FINAL_VERDICT_DATA.verdict_explanation}\n`);
    
    console.log("\x1b[1mSummary of Ronaldo Fan Key Points:\x1b[0m");
    FINAL_VERDICT_DATA.summary_of_arguments.ronaldo_fan_key_points.forEach(p => console.log(` - ${p}`));
    
    console.log("\n\x1b[1mSummary of Messi Fan Key Points:\x1b[0m");
    FINAL_VERDICT_DATA.summary_of_arguments.messi_fan_key_points.forEach(p => console.log(` - ${p}`));
    
    console.log(`\n\x1b[1mBluff & Lie Detection Summary:\n\x1b[0m Ronaldo Fan: ${FINAL_VERDICT_DATA.bluff_detection_summary.ronaldo_fan_bluffs_detected}\n Messi Fan:   ${FINAL_VERDICT_DATA.bluff_detection_summary.messi_fan_bluffs_detected}`);
    console.log("\n========================================================\n🏁 Mock Debate Closed Successfully! 🏁\n========================================================\n");
}

runMockDebate(5);
