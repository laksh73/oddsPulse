require("dotenv").config();

const { Centrifuge } = require("centrifuge");

const getLiveMarkets = require("./liveMarkets");

const saveOddsSnapshot = require("./saveOddsSnapshot");

// const getLiveTieMarkets = require("./liveTieMarkets");

const latestOdds = {};  //latestOdds stores: marketHash → latest odds

const subscriptions = {}; //subscriptions stores : marketHash → WebSocket subscription

const missingMarkets = {};
const Odds = require("./models/Odds");


let snapshotTimeout = null;
let snapshotLoopStarted = false;

let refreshInterval = null;

async function saveLiveSnapshots() {
    try {
        for (const [marketHash, market] of Object.entries(latestOdds)) {
            if (subscriptions[marketHash]) {
                await saveOddsSnapshot(marketHash, market);
            }
        }
    } catch (error) {
        console.error("Snapshot loop failed:", error.message);
    } finally {
        snapshotTimeout = setTimeout(saveLiveSnapshots, 5000);
    }
}


async function getRealtimeToken() {
  const response = await fetch(
    "https://api.sx.bet/user/realtime-token-v3/api-key",
    {
      headers: {
        "x-sx-api-key": process.env.SX_API_KEY
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Token request failed: ${response.status}`);
  }

  const data = await response.json();

  return data.token;
}


function subscribeToMarket(client, market) {
  const marketHash = market.marketHash;
  const sub = client.newSubscription(
    `orderbook_v3:${marketHash}`
  );

  sub.on("subscribed", (ctx) => {
    console.log("Subscribed!", ctx.channel);
  });

  sub.on("publication", (ctx) => {
    const data = ctx.data;

    latestOdds[marketHash] = {
      outcomeOne: data.outcomeOne[0]?.percentageOdds ?? null,
      outcomeTwo: data.outcomeTwo[0]?.percentageOdds ?? null,
      version: data.version,

      outcomeOneName: market.outcomeOneName,
      outcomeTwoName: market.outcomeTwoName,
      teamOneName: market.teamOneName,
      teamTwoName: market.teamTwoName,
      eventId: market.sportXeventId ?? market.eventId,
      marketType: market.type ?? market.marketType,
      sportLabel: market.sportLabel
    };

    console.log("Latest odds:", marketHash, latestOdds[marketHash]);
  });

  sub.on("error", (ctx) => {
    console.log("Subscription error:", ctx);
  });

  sub.subscribe();

  subscriptions[marketHash] = sub; // Store the subscription
}



async function refreshLiveMarkets(client) {
  const markets = await getLiveMarkets();
  // const tieMarkets = await getLiveTieMarkets(markets);

  // const allMarkets = [...markets, ...tieMarkets];

  const liveHashes = new Set(
    markets.map((market) => market.marketHash)
  );



  for (const market of markets) { // Check if any previously missing markets have returned
      const marketHash = market.marketHash;

    if (missingMarkets[marketHash]) {
        clearTimeout(missingMarkets[marketHash]); // Cancel the scheduled deletion
        delete missingMarkets[marketHash];

        console.log(
            `Market returned. Cancelled history deletion: ${marketHash}`
        );
    }
  }



  // Subscribe to newly live markets
  for (const market of markets) {  
    if (!subscriptions[market.marketHash]) {
      subscribeToMarket(client, market);
    }
  }




  for (const marketHash of Object.keys(subscriptions)) { // Unsubscribe from markets that are no longer live

    if (!liveHashes.has(marketHash)) { // Market is no longer live
        subscriptions[marketHash].unsubscribe(); // Unsubscribe from the market
        delete subscriptions[marketHash];
        delete latestOdds[marketHash];


        // Schedule deletion of historical snapshots after 1 hour
        if (!missingMarkets[marketHash]) { 
            console.log(
                `Market disappeared. Keeping history for one hour: ${marketHash}`
            );

            missingMarkets[marketHash] = setTimeout(async () => {
                try {
                    const result = await Odds.deleteMany({ marketHash });

                    console.log(
                        `Deleted ${result.deletedCount} snapshots for ${marketHash}`
                    );
                } catch (error) {
                    console.error(
                        `Failed to delete history for ${marketHash}:`,
                        error.message
                    );
                }

                delete missingMarkets[marketHash];
            }, 60 * 60 * 1000);
        }
    }
}



}


async function connectRealtime() {
  const token = await getRealtimeToken();

  console.log("Realtime token received");

  const client = new Centrifuge(
    "wss://realtime.sx.bet/connection/websocket",
    { token }
  );

  client.on("connecting", (ctx) => {
    console.log("Connecting...", ctx);
  });

  client.on("connected", async (ctx) => {
    console.log("Connected!", ctx);

    try {
      await refreshLiveMarkets(client);
    } catch (error) {
      console.error("Failed to refresh live markets:", error.message);
    }


    if (!snapshotLoopStarted) {
      snapshotLoopStarted = true;
      saveLiveSnapshots();
    }


    if (!refreshInterval) { // Start the refresh interval if it hasn't been started yet
      refreshInterval = setInterval(async () => {
        try {
          await refreshLiveMarkets(client);
        } catch (error) {
          console.error("Failed to refresh live markets:", error.message);
        }
      }, 60000);
    }

  });


  client.on("disconnected", (ctx) => {
    console.log("Disconnected:", ctx);
  });

  client.on("error", (ctx) => {
    console.log("Error:", ctx);
  });

  client.connect();
}


connectRealtime().catch((error) => {
  console.error(error);
});

module.exports = latestOdds;