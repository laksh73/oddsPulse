const express = require("express");
const cors = require("cors");
require("dotenv").config();

const allMarkets = require("./allMarketsBySports");
const latestOdds = require("./realtime");
const connectDB = require("./db");  
const Odds = require("./models/Odds"); // Import the Odds model

const app = express();

app.use(cors());
app.use(express.json()); //middleware to parse incoming JSON requests


function formatPercentage(value) {
    return value != null ? Number(value) / 1e18 : null;
}

function roundToTwoDecimals(value) {
    return value !== null ? Number(value.toFixed(2)) : null;
}


async function getMarketPercentages(marketHash) {
    const response = await fetch(
        `https://api.sx.bet/orderbook-v3/snapshot?marketHash=${marketHash}`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch orderbook");
    }

    const { data } = await response.json();

    const outcomeOne = data.outcomeOne[0]?.percentageOdds;
    const outcomeTwo = data.outcomeTwo[0]?.percentageOdds;

    return {
        outcomeOne:
            outcomeOne != null
                ? Number((Number(outcomeOne) / 1e18).toFixed(2))
                : null,
        outcomeTwo:
            outcomeTwo != null
                ? Number((Number(outcomeTwo) / 1e18).toFixed(2))
                : null
    };
}


app.get("/api/health", (req, res) => {
    res.json({       //just like res.send but it sends a JSON response instead of a string or HTML
        status:"ok",
        message: "just testing the connection between client and server"
    });
});


app.get("/api/markets/:marketHash/history", async (req, res) => { // this route is to fetch the odds history for a specific marketHash
    try {
        const { marketHash } = req.params;

        // Fetch the odds history for the given marketHash from the database
        const history = await Odds.find({ marketHash }) 
            .sort({ timestamp: 1 });            // Sort by timestamp in ascending order     

        res.json(history);
    } catch (error) {
        console.error("Failed to fetch odds history:", error.message);
        res.status(500).json({ error: "Failed to fetch odds history" });
    }
});



app.get("/api/markets", async (req, res) => { //testing
    try {
        
        
    const markets = await allMarkets();

    const results = [];
    const BATCH_SIZE = 25;
    const BATCH_DELAY = 500; // 1 second

    const sleep = (ms) =>
        new Promise((resolve) => setTimeout(resolve, ms));

    for (let i = 0; i < markets.length; i += BATCH_SIZE) {
        const batch = markets.slice(i, i + BATCH_SIZE);

        const batchResults = await Promise.all(
            batch.map(async (market) => {
                try {
                    const percentages = await getMarketPercentages(
                        market.marketHash
                    );

                    const { outcomeOne, outcomeTwo } = percentages;

                    return {
                        marketHash: market.marketHash,
                        eventId: market.sportXeventId,
                        sport: market.sportLabel,
                        league: market.leagueLabel,
                        gameTime: market.gameTime,
                        teamOne: market.teamOneName,
                        teamTwo: market.teamTwoName,
                        outcomeOneName: market.outcomeOneName,
                        outcomeTwoName: market.outcomeTwoName,
                        outcomeOne,
                        outcomeTwo,
                        edge:
                            outcomeOne != null && outcomeTwo != null
                                ? Number(
                                    (100 - outcomeOne - outcomeTwo).toFixed(2)
                                )
                                : null,
                    };
                } catch (error) {
                    console.error(
                        `Failed to fetch snapshot for ${market.marketHash}:`,
                        error.message
                    );

                    return {
                        marketHash: market.marketHash,
                        eventId: market.sportXeventId,
                        sport: market.sportLabel,
                        league: market.leagueLabel,
                        gameTime: market.gameTime,
                        teamOne: market.teamOneName,
                        teamTwo: market.teamTwoName,
                        outcomeOneName: market.outcomeOneName,
                        outcomeTwoName: market.outcomeTwoName,
                        outcomeOne: null,
                        outcomeTwo: null,
                        edge: null,
                    };
                }
            })
        );

        results.push(...batchResults);

        console.log(
            `Processed ${Math.min(i + BATCH_SIZE, markets.length)} / ${markets.length}`
        );

        // Wait between batches, but not after the final batch
        if (i + BATCH_SIZE < markets.length) {
            await sleep(BATCH_DELAY);
        }
    }

    res.json(results);

        } catch (error) {
            console.error(error.message);

            res.status(500).json({
                message: "Failed to fetch markets"
            });
        }
});




app.get("/api/markets/live", (req, res) => {  // this route is alomost completed
    const markets = [];

    for (const [marketHash, market] of Object.entries(latestOdds)) {
        const outcomeOne = roundToTwoDecimals(formatPercentage(market.outcomeOne));
        const outcomeTwo = roundToTwoDecimals(formatPercentage(market.outcomeTwo));

        markets.push({
            marketHash,
            sport: market.sportLabel,
            eventId: market.eventId,
            teamOne: market.teamOneName,
            teamTwo: market.teamTwoName,
            outcomeOneName: market.outcomeOneName,
            outcomeTwoName: market.outcomeTwoName,
            outcomeOne,
            outcomeTwo,
            edge:
                outcomeOne !== null && outcomeTwo !== null
                    ? roundToTwoDecimals(100 - (outcomeOne + outcomeTwo))
                    : null
        });
    }

    res.json(markets);
});




app.get("/api/markets/:marketHash/latest", async (req, res) => { //
    try {
        const { marketHash } = req.params;

        const latestOdds = await Odds.findOne({ marketHash })
            .sort({ timestamp: -1 });

        if (!latestOdds) {
            return res.status(404).json({
                error: "No odds history found for this market"
            });
        }

        res.json(latestOdds);
    } catch (error) {
        console.error("Failed to fetch latest odds:", error.message);
        res.status(500).json({
            error: "Failed to fetch latest odds"
        });
    }
});


const PORT = process.env.PORT || 5000;

async function startServer() {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

startServer();