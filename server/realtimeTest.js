require("dotenv").config();

const { Centrifuge } = require("centrifuge");

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

async function connect() {
    try {
        const token = await getRealtimeToken();

        console.log("Realtime token received");

        const client = new Centrifuge(
            "wss://realtime.sx.bet/connection/websocket",
            {
                token
            }
        );

        client.on("connecting", (ctx) => {
            console.log("Connecting...", ctx);
        });

        client.on("connected", async (ctx) => {
            console.log("Connected!", ctx);

            const marketsResponse = await fetch(
            "https://api.sx.bet/markets/active?onlyMainLine=true"
            );

            const marketsData = await marketsResponse.json();

            const marketHash = '0xf3050332f79e7b1a7a2a1e95e8e210b47088a0203f0caa92efbf8dc71a24ea8e';

            console.log("Testing market:", marketHash);


            const sub = client.newSubscription(
            `orderbook_v3:${marketHash}`
            );

            sub.on("subscribing", (ctx) => {
                console.log("Subscribing...", ctx);
            });

            sub.on("subscribed", (ctx) => {
                console.log("Subscribed!", ctx);
            });

            sub.on("publication", (ctx) => {
                console.log("Order book update:");
                console.log(JSON.stringify(ctx.data, null, 2));
            });

            sub.on("error", (ctx) => {
                console.log("Subscription error:", ctx);
            });

            sub.subscribe();
        });

        client.on("disconnected", (ctx) => {
            console.log("Disconnected:", ctx);
        });

        client.on("error", (ctx) => {
            console.log("Error:", ctx);
        });

        client.connect();
    } catch (error) {
        console.error(error);
    }
}

connect();