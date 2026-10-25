async function getActiveLeagues(){
    const response = await fetch("https://api.sx.bet/leagues/active");

    if (!response.ok) {
        throw new Error(`Leagues request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
}

async function getFixtures(leagueId) {
    const response = await fetch(
        `https://api.sx.bet/fixture/active?leagueId=${leagueId}`
    );

    if (!response.ok) {
        throw new Error(`Fixtures request failed: ${response.status}`);
    }

    const data = await response.json();

    return data.data;
}

async function getAllFixtures(){

    const leagues = await getActiveLeagues();
    console.log("Active leagues:", leagues.length);

    const fixturesByLeague = await Promise.all( // Fetch fixtures for all leagues in parallel
        leagues.map((league) => getFixtures(league.leagueId))
    );

    const allFixtures = fixturesByLeague.flat();
    console.log("Total fixtures:", allFixtures.length);

    return allFixtures;


}

const allFixtures = getAllFixtures().catch((error) => {
    console.error(error);
    throw error;
});

module.exports= allFixtures;