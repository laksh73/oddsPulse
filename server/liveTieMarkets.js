async function getLiveTieMarkets(teamMarkets) {

  if (!teamMarkets || teamMarkets.length === 0) {
    return [];
  }

  const tieMarkets = await Promise.all(
    teamMarkets.map(async (teamMarket) => {
      try {
        const response = await fetch(
          `https://api.sx.bet/markets/active?eventId=${teamMarket.sportXeventId}&liveOnly=true`
        );

        if (!response.ok) {
          throw new Error(`Markets request failed: ${response.status}`);
        }

        const data = await response.json();

        const tieMarket = data.data.markets.find(
          (market) =>
            market.type === 1 
            &&
            market.outcomeOneName === "Tie" &&
            market.outcomeTwoName === "Not tie"
        );

        if (!tieMarket) {
          return null;
        }

        return {
          eventId: teamMarket.sportXeventId,
          teamOneName: teamMarket.teamOneName,
          teamTwoName: teamMarket.teamTwoName,
          marketHash: tieMarket.marketHash,
          outcomeOneName: tieMarket.outcomeOneName,
          outcomeTwoName: tieMarket.outcomeTwoName,
          marketType: tieMarket.type
        };
      } catch (error) {
        console.error(
          `Failed to fetch Tie market for event ${teamMarket.sportXeventId}:`,
          error.message
        );

        return null;
      }
    })
  );

  return tieMarkets.filter(Boolean); //if an event has no Tie market, return null
}


module.exports = getLiveTieMarkets;