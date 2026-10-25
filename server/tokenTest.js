require("dotenv").config();

async function getToken() {
    const response = await fetch(
        "https://api.sx.bet/user/realtime-token-v3/api-key",
        {
            headers: {
                "x-sx-api-key": process.env.SX_API_KEY
            }
        }
    );

    const text = await response.text();

    console.log("Status:", response.status);
    console.log("Response:", text);
}

getToken();