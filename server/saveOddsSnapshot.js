const Odds = require("./models/Odds");

async function saveOddsSnapshot(marketHash, market) {
    const outcomeOne =
        market.outcomeOne != null
            ? Number((Number(market.outcomeOne) / 1e18).toFixed(2))
            : null;

    const outcomeTwo =
        market.outcomeTwo != null
            ? Number((Number(market.outcomeTwo) / 1e18).toFixed(2))
            : null;

    const edge =
        outcomeOne !== null && outcomeTwo !== null
            ? Number((100 - outcomeOne - outcomeTwo).toFixed(2))
            : null;

    try {
        await Odds.create({
            eventId: market.eventId,
            marketHash,
            outcomeOne,
            outcomeTwo,
            edge
        });

        console.log(`Odds snapshot saved: ${marketHash}`);
    } catch (error) {
        console.error(
            `Failed to save odds snapshot for ${marketHash}:`,
            error.message
        );
    }
}

module.exports = saveOddsSnapshot;