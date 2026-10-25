require("dotenv").config();

async function test() {
  const marketsResponse = await fetch(
    "https://api.sx.bet/markets/active?onlyMainLine=true"
  );

  const marketsData = await marketsResponse.json();

  const markets = marketsData.data.markets.slice(0, 20);

  for (const market of markets) {
    const response = await fetch(
      `https://api.sx.bet/orderbook-v3/snapshot?marketHash=${market.marketHash}`
    );

    const data = await response.json();

    const book = data.data;

    const hasOrders =
      book.outcomeOne.length > 0 ||
      book.outcomeTwo.length > 0;

    console.log(
      market.outcomeOneName,
      "vs",
      market.outcomeTwoName,
      "→",
      hasOrders ? "HAS ODDS" : "empty"
    );

    if (hasOrders) {
      console.log("\nFOUND MARKET:");
      console.log(market.marketHash);
      console.log(JSON.stringify(book, null, 2));
      break;
    }
  }
}

test();