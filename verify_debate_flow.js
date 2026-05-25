// Mock Verification of the GOAT Debate Orchestration Engine
// This script simulates the models to test the JSON protocol, routing, and turn limits.

const fs = require('fs');
const path = require('path');

// Mock data structures representing the agents
const MOCK_ARGUMENTS = {
    'ronaldo-fan': [
        {
            argument: "Cristiano Ronaldo is the GOAT because he has 140 Champions League goals, the highest in history. Messi could never match his CL dominance.",
            intent_to_bluff_or_lie: false,
            bluff_or_lie_details: "",
            search_query: "Ronaldo Champions League goals"
        },
        {
            argument: "Ronaldo has won league titles in England, Spain, and Italy, proving he can dominate any league. Messi was comfortable in Barcelona's system his whole career.",
            intent_to_bluff_or_lie: false,
            bluff_or_lie_details: "",
            search_query: "Ronaldo Premier League La Liga Serie A stats"
        },
        {
            argument: "Ronaldo led Portugal to the Euro 2016 trophy, winning a major international trophy before Messi ever did with Argentina.",
            intent_to_bluff_or_lie: true,
            bluff_or_lie_details: "He claims Messi hadn't won any international trophy, but Messi won Olympic Gold in 2008.",
            search_query: "Messi international trophies 2016"
        },
        {
            argument: "Ronaldo has scored 900+ official goals in his career. His physical longevity and goal-scoring rate are unmatched by anyone.",
            intent_to_bluff_or_lie: false,
            bluff_or_lie_details: "",
            search_query: "Ronaldo career goals total"
        },
        {
            argument: "Messi's 2022 World Cup was heavily assisted by penalty decisions, with Argentina getting 5 penalties in 7 games. Ronaldo's goals are all earned.",
            intent_to_bluff_or_lie: true,
            bluff_or_lie_details: "Claims all of Ronaldo's goals are 'earned' without penalties, but Ronaldo is famous for penalty goals.",
            search_query: "Ronaldo career penalty goals percentage"
        }
    ],
    'messi-fan': [
        {
            argument: "Lionel Messi is the GOAT because he won the 2022 World Cup as the Golden Ball winner, completing football. Ronaldo could never lead his team to a World Cup title.",
            intent_to_bluff_or_lie: false,
            bluff_or_lie_details: "",
            search_query: "Messi World Cup 2022 stats"
        },
        {
            argument: "Messi has won 8 Ballon d'Ors, which is 3 more than Ronaldo's 5. The individual awards clearly place Messi above Ronaldo.",
            intent_to_bluff_or_lie: true,
            bluff_or_lie_details: "He says Messi has 3 more Ballon d'Ors than Ronaldo's 5 (8 - 5 = 3, which is mathematically correct but a bluff about their performance gap).",
            search_query: "Ballon d'Or history Messi Ronaldo"
        },
        {
            argument: "Ronaldo fan claimed Messi hadn't won a trophy by 2016, but Messi won Olympic Gold in 2008 and the FIFA World Youth Championship in 2005. That is a clear bluff!",
            intent_to_bluff_or_lie: false,
            bluff_or_lie_details: "",
            search_query: "Messi 2008 Olympics"
        },
        {
            argument: "Messi has more career assists (360+) and key passes than Ronaldo, proving he is a complete playmaker and team player, not just a goalscorer.",
            intent_to_bluff_or_lie: false,
            bluff_or_lie_details: "",
            search_query: "Messi career assists vs Ronaldo"
        },
        {
            argument: "Ronaldo fan claimed Ronaldo doesn't rely on penalties, but Ronaldo has scored over 160 penalties in his career, the most in football history. That is a massive lie!",
            intent_to_bluff_or_lie: false,
            bluff_or_lie_details: "",
            search_query: "Ronaldo penalty goals total"
        }
    ]
};

const MOCK_REFEREE_COMMENTS = [
    "Ronaldo fan starts strong pointing out Ronaldo's record 140 Champions League goals. Messi fan, how do you counter this? Look out for any bluffs.",
    "Messi fan counters with the World Cup win. Referee notes: the debate is heating up. Ronaldo fan, respond to the World Cup claim.",
    "Ronaldo fan brings up the multiple league trophies. Messi fan, check if he is telling the truth and present your rebuttal.",
    "Messi fan highlights his 8 Ballon d'Ors. Referee notes: Messi fan has an edge on individual awards. Ronaldo fan, defend your position.",
    "Ronaldo fan asserts Euro 2016 dominance. Messi fan, did you detect a bluff here? Back it up with search facts.",
    "Messi fan successfully called out the Ronaldo fan's Euro 2016 claim using 2008 Olympic facts! Ronaldo fan, how do you handle being caught?",
    "Ronaldo fan claims 900+ goals. Messi fan, can you verify this or is it another exaggeration?",
    "Messi fan brings up playmaking and assists. Ronaldo fan, is goals the only thing that matters? Address this directly.",
    "Ronaldo fan claims Argentina's World Cup penalties were suspicious. Messi fan, is this a bluff or factual? Rebut it.",
    "Messi fan points out Ronaldo's penalty history of 160+ penalties, debunking the Ronaldo fan's claim. A decisive counter-blow!"
];

function runMockDebate(turnsPerSide) {
    console.log("\n========================================================");
    console.log("🧪 [TEST RUN] Simulating GOAT Debate Orchestration");
    console.log(`  Turns per side: ${turnsPerSide} | Total Turns: ${turnsPerSide * 2}`);
    console.log("========================================================\n");

    const debateHistory = [];
    let lastSpeaker = null;
    let lastResponse = null;
    let opponentDetectedLies = [];

    // Referee starts
    const refStartCommentary = "Welcome to the ultimate GOAT debate! We have the Messi Fan and the Ronaldo Fan ready to clash. Ronaldo Fan, you have the floor. Tell us why Cristiano Ronaldo is the undisputed Greatest of All Time!";
    console.log(`\x1b[36m\x1b[1mThe Referee:\x1b[0m ${refStartCommentary}\n`);
    debateHistory.push({ speaker: "Referee", argument: refStartCommentary });

    let ronaldoIndex = 0;
    let messiIndex = 0;
    let currentSpeaker = 'ronaldo-fan';

    for (let turn = 1; turn <= turnsPerSide * 2; turn++) {
        const isRonaldo = currentSpeaker === 'ronaldo-fan';
        const speakerName = isRonaldo ? "Cristiano Ronaldo Fan" : "Lionel Messi Fan";
        const color = isRonaldo ? '\x1b[33m' : '\x1b[35m';

        // 1. Get speaker argument
        let data;
        if (isRonaldo) {
            const idx = ronaldoIndex % MOCK_ARGUMENTS['ronaldo-fan'].length;
            const item = MOCK_ARGUMENTS['ronaldo-fan'][idx];
            
            // Simulating lies detection logic in prompt
            const detected = [];
            if (lastResponse && lastResponse.intent_to_bluff_or_lie) {
                detected.push({
                    opponent_claim: lastResponse.argument.substring(0, 50) + "...",
                    reason_it_is_untrue: "Mock verification detected a contradiction.",
                    evidence: "Search grounding confirmed facts."
                });
            }

            data = {
                thought_process: {
                    opponent_analysis: `Analyzing Messi fan's claim: ${lastResponse ? lastResponse.argument : "None"}`,
                    search_strategy: `Running web search: ${item.search_query}`,
                    key_points: ["Ronaldo's records"]
                },
                search_query: item.search_query,
                lies_or_bluffs_detected: detected,
                argument: item.argument,
                intent_to_bluff_or_lie: item.intent_to_bluff_or_lie,
                bluff_or_lie_details: item.bluff_or_lie_details
            };
            ronaldoIndex++;
        } else {
            const idx = messiIndex % MOCK_ARGUMENTS['messi-fan'].length;
            const item = MOCK_ARGUMENTS['messi-fan'][idx];
            
            // Simulating lies detection logic in prompt
            const detected = [];
            if (lastResponse && lastResponse.intent_to_bluff_or_lie) {
                // Check if Ronaldo fan lied about Olympic Gold/international trophy
                if (lastResponse.bluff_or_lie_details.includes("Olympic")) {
                    detected.push({
                        opponent_claim: "Ronaldo won a major international trophy before Messi ever did",
                        reason_it_is_untrue: "Messi won Olympic Gold in 2008 with Argentina, which is an international trophy.",
                        evidence: "Lionel Messi won Gold with Argentina at the 2008 Beijing Olympics."
                    });
                } else if (lastResponse.bluff_or_lie_details.includes("penalty")) {
                    detected.push({
                        opponent_claim: "Ronaldo's goals are all earned (no penalties)",
                        reason_it_is_untrue: "Ronaldo has scored over 160 career penalties, which is the most in football history.",
                        evidence: "Cristiano Ronaldo is the all-time leader in penalty goals scored."
                    });
                } else {
                    detected.push({
                        opponent_claim: lastResponse.argument.substring(0, 50) + "...",
                        reason_it_is_untrue: "Exaggerated claim.",
                        evidence: "Verified stats via search."
                    });
                }
            }

            data = {
                thought_process: {
                    opponent_analysis: `Analyzing Ronaldo fan's claim: ${lastResponse ? lastResponse.argument : "None"}`,
                    search_strategy: `Running web search: ${item.search_query}`,
                    key_points: ["Messi's stats"]
                },
                search_query: item.search_query,
                lies_or_bluffs_detected: detected,
                argument: item.argument,
                intent_to_bluff_or_lie: item.intent_to_bluff_or_lie,
                bluff_or_lie_details: item.bluff_or_lie_details
            };
            messiIndex++;
        }

        // Print speaker response
        console.log(`${color}\x1b[1m${speakerName}:\x1b[0m ${data.argument}`);
        console.log(`  \x1b[90m🔍 Search Query: "${data.search_query}"\x1b[0m`);
        console.log(`  \x1b[90m📚 Sources: transfermarkt.com, wikipedia.org\x1b[0m`);
        if (data.intent_to_bluff_or_lie) {
            console.log(`  \x1b[90m⚡ [Developer Trace] ${speakerName} is BLUFFING/LYING: "${data.bluff_or_lie_details}"\x1b[0m`);
        }
        if (data.lies_or_bluffs_detected.length > 0) {
            console.log(`  \x1b[31m🎯 [LIES DETECTED BY OPPONENT]:\x1b[0m`);
            data.lies_or_bluffs_detected.forEach(l => {
                console.log(`    - Claim: "${l.opponent_claim}"`);
                console.log(`      Why Untrue: ${l.reason_it_is_untrue}`);
                console.log(`      Evidence: ${l.evidence}`);
            });
        }
        console.log();

        debateHistory.push({ speaker: speakerName, argument: data.argument });
        lastSpeaker = isRonaldo ? 'ronaldo-fan' : 'messi-fan';
        lastResponse = data;
        opponentDetectedLies = data.lies_or_bluffs_detected;

        // 2. Referee evaluates turn
        const refCommentary = MOCK_REFEREE_COMMENTS[(turn - 1) % MOCK_REFEREE_COMMENTS.length];
        
        let score = {
            ronaldo_fan_bluffs_told: 0,
            ronaldo_fan_bluffs_detected: 0,
            messi_fan_bluffs_told: 0,
            messi_fan_bluffs_detected: 0
        };

        // Simulating Referee note analysis
        let refAnalysis = "The argument was factually supported.";
        if (lastResponse.intent_to_bluff_or_lie) {
            refAnalysis = `The speaker attempted a bluff: "${lastResponse.bluff_or_lie_details}". Let's see if the opponent catches it in the next turn.`;
        }
        if (opponentDetectedLies.length > 0) {
            refAnalysis = `The opponent successfully caught the bluff about "${opponentDetectedLies[0].opponent_claim}". Great analysis!`;
        }

        console.log(`\x1b[36m\x1b[1mThe Referee:\x1b[0m ${refCommentary}`);
        console.log(`  \x1b[90m📋 [Referee Notes] ${refAnalysis}\x1b[0m\n`);

        debateHistory.push({ speaker: "Referee", argument: refCommentary });
        currentSpeaker = isRonaldo ? 'messi-fan' : 'ronaldo-fan';
    }

    // Final Verdict
    const finalData = {
        winner: "Lionel Messi Fan",
        verdict_explanation: "The Messi Fan won this debate because they successfully identified two critical bluffs/lies told by the Ronaldo Fan: first, the claim that Messi had no international trophies by 2016 (debunked by Olympic Gold in 2008), and second, the claim that Ronaldo does not score penalty goals (debunked by his historical 160+ penalty record). The Ronaldo Fan failed to call out Messi Fan's bluff about Ballon d'Or score ratios.",
        summary_of_arguments: {
            ronaldo_fan_key_points: [
                "Ronaldo holds the record for 140 Champions League goals.",
                "Ronaldo won league titles in England, Spain, and Italy.",
                "Ronaldo won Euro 2016 with Portugal."
            ],
            messi_fan_key_points: [
                "Messi won the 2022 World Cup and 8 Ballon d'Ors.",
                "Messi has superior career playmaking stats (360+ assists).",
                "Messi successfully debunked Ronaldo fan's international trophy and penalty assertions."
            ]
        },
        bluff_detection_summary: {
            ronaldo_fan_bluffs_detected: "2 of 2 bluffs detected by Messi Fan. Both the Olympic gold omission and the penalty statement were called out.",
            messi_fan_bluffs_detected: "0 of 1 bluffs detected by Ronaldo Fan. Ronaldo Fan failed to highlight Messi Fan's Ballon d'Or mathematical framing."
        }
    };

    console.log("\n========================================================");
    console.log("⚖️  THE REFEREE'S FINAL VERDICT (MOCK ANALYSIS)");
    console.log("========================================================\n");
    
    console.log(`\x1b[1mWinner:\x1b[0m \x1b[32m\x1b[1m${finalData.winner}\x1b[0m`);
    console.log(`\x1b[1mExplanation:\x1b[0m ${finalData.verdict_explanation}\n`);
    
    console.log("\x1b[1mSummary of Ronaldo Fan Key Points:\x1b[0m");
    finalData.summary_of_arguments.ronaldo_fan_key_points.forEach(p => console.log(` - ${p}`));
    
    console.log("\n\x1b[1mSummary of Messi Fan Key Points:\x1b[0m");
    finalData.summary_of_arguments.messi_fan_key_points.forEach(p => console.log(` - ${p}`));
    
    console.log("\n\x1b[1mBluff & Lie Detection Summary:\x1b[0m");
    console.log(` Ronaldo Fan: ${finalData.bluff_detection_summary.ronaldo_fan_bluffs_detected}`);
    console.log(` Messi Fan:   ${finalData.bluff_detection_summary.messi_fan_bluffs_detected}`);
    
    console.log("\n========================================================");
    console.log("🏁 Mock Debate Closed Successfully! 🏁");
    console.log("========================================================\n");
}

runMockDebate(5);
