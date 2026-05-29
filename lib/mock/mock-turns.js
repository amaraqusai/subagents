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

const FINAL_VERDICT_DATA = {
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

module.exports = {
    MOCK_ARGUMENTS,
    MOCK_REFEREE_COMMENTS,
    FINAL_VERDICT_DATA
};
