const serveFixtures = require("./serveFixtures"); //testing

async function getMoneyline(fixture) { //upcoming moneyline 
    try {
        const response = await fetch(
            `https://api.sx.bet/markets/active?eventId=${fixture.eventId}`
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        return data.data.markets.filter(
            (market) => market.type === 226 || market.type === 52
        );
    } catch (error) {
        console.error(
            `Failed to fetch markets for ${fixture.eventId}:`,
            error.message
        );

        return undefined;
    }
}


async function getAllMarkets() {
    
    const allFixtures = await serveFixtures; //testing


    const now = Date.now();
    const OneDaysLater = now + 1 * 24 * 60 * 60 * 1000;

    const recentUpcomingFixtures = allFixtures.filter((fixture) => {
        const startTime = new Date(fixture.startDate).getTime();
        return (
            startTime >= now &&
            startTime <= OneDaysLater
        );
    });

    async function processInBatches(fixtures, batchSize = 5) {
        const results = [];

        for (let i = 0; i < fixtures.length; i += batchSize) {
            const batch = fixtures.slice(i, i + batchSize);

            const batchResults = await Promise.all(
                batch.map((fixture) => getMoneyline(fixture))
            );

            results.push(...batchResults);
        }

        return results;
    }

    const sortedRecentUpcomingFixtures = [...recentUpcomingFixtures]
    .sort((a, b) => a.gameTime - b.gameTime);

    const results = await processInBatches(sortedRecentUpcomingFixtures.slice(0,100), 25);

    const sortedRecentUpcomingMoneyLine = results.flat(); //to flatten the arrays into one single array and remove empty arrays at the same time:

    // const sortedRecentUpcomingMoneyLine = [...recentUpcomingMoneyLine]
    // .sort((a, b) => a.gameTime - b.gameTime);

    return sortedRecentUpcomingMoneyLine;

}


module.exports = getAllMarkets;