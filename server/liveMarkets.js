// async function getActiveLeagues(){
//     const response = await fetch("https://api.sx.bet/leagues/active");

//     if (!response.ok) {
//         throw new Error(`Leagues request failed: ${response.status}`);
//     }

//     const data = await response.json();
//     return data.data;
// }

// async function getFixtures(leagueId) {
//     const response = await fetch(
//         `https://api.sx.bet/fixture/active?leagueId=${leagueId}`
//     );

//     if (!response.ok) {
//         throw new Error(`Fixtures request failed: ${response.status}`);
//     }

//     const data = await response.json();

//     return data.data;
// }

const serveFixtures = require("./serveFixtures"); //testing
// const allFixtures= require("./serveFixtures"); //testing

async function getLiveMoneyline(fixture) {
    try {
        const response = await fetch(
            `https://api.sx.bet/markets/active?eventId=${fixture.eventId}&liveOnly=true`
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        // console.log(
        //     "Fixture:",
        //     fixture.eventId,
        //     "Sport:",
        //     fixture.sportId,
        //     "Market types:",
        //     data.data.markets.map((market) => ({
        //         type: market.type,
        //         sportLabel: market.sportLabel,
        //         outcomeOneName: market.outcomeOneName,
        //         outcomeTwoName: market.outcomeTwoName
        //     }))
        // );

        return data.data.markets.find(
            (market) => market.type === 52    
        );
    } catch (error) {
        console.error(
            `Failed to fetch markets for ${fixture.eventId}:`,
            error.message
        );

        return undefined;
    }
}


async function getLiveMarkets() {

    // const leagues = await getActiveLeagues();

    // console.log("Active leagues:", leagues.length);

    // const fixturesByLeague = await Promise.all( // Fetch fixtures for all leagues in parallel
    //     leagues.map((league) => getFixtures(league.leagueId))
    // );

    // const allFixtures = fixturesByLeague.flat();

    // console.log("Total fixtures:", allFixtures.length);

    const allFixtures = await serveFixtures; //testing


    const liveFixtures = allFixtures.filter(
        (fixture) => fixture.status === 2
    );

    console.log("Live fixtures:", liveFixtures.length);

    const yesterday = new Date();// Get the current date and time
    yesterday.setDate(yesterday.getDate() - 1);// Subtract one day from the current date
    yesterday.setHours(0, 0, 0, 0); // Set the time to midnight (00:00:00) to get the start of the day

    const recentLiveFixtures = liveFixtures.filter(
        (fixture) => new Date(fixture.startDate) >= yesterday
    );

    console.log("Recent live fixtures:", recentLiveFixtures.length);


    const results = await Promise.all(
    recentLiveFixtures.map((fixture) =>
        getLiveMoneyline(fixture)
    )
    );

    const liveMarkets = results.filter( // Filter out undefined results
        (market) => market !== undefined
    );

    console.log("Live Moneyline markets:", liveMarkets.length);
    console.log("livemarkets: ",liveMarkets);

    return liveMarkets;

}


module.exports = getLiveMarkets;