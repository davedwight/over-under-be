require("dotenv").config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);
const Twilio = require("./twilio-model");
const axios = require("axios");

let votesArr = [];

const getStockData = (stockSymbol, index) => {
    axios
        .get(
            `https://finnhub.io/api/v1/quote?symbol=${stockSymbol}&token=sandbox_c8ct8raad3i9nv0d14tg`
        )
        .then((res) => {
            const end_price = parseFloat(res.data.c.toFixed(2));
            let result = null;
            if (
                end_price > votesArr[index].start_price &&
                votesArr[index].response_value === "over"
            ) {
                result = "won";
            } else if (
                end_price < votesArr[index].start_price &&
                votesArr[index].response_value === "under"
            ) {
                result = "won";
            } else if (end_price === votesArr[index].start_price) {
                result = "tied";
            } else {
                result = "lost";
            }

            votesArr[index] = {
                ...votesArr[index],
                end_price,
                result,
            };
            sendSMS(votesArr[index]);
        })
        .catch((err) => console.error(err));
};

function searchVotes() {
    Twilio.getExpiredVotes()
        .then((votes) => {
            if (votes.length > 0) {
                votesArr = votes;
                votes.map((vote, index) => {
                    getStockData(vote.stock_symbol, index);
                });
            }
        })
        .catch((err) => console.error(err));
}

const messages = {
    won: "Congrats! You won this OVER / UNDER.\n",
    lost: "Bummer. You lost this OVER / UNDER.\n",
    tied: "It's a tie! The price of this OVER / UNDER didn't change.\n",
};

const emojis = {
    over: "📈",
    under: "📉",
};

function sendSMS(data) {
    console.log(
        `${messages[data.result]}${data.stock_symbol} | ${
            emojis[data.response_value]
        } | ${data.response_length} mins`
    );
    client.messages
        .create({
            body: `${messages[data.result]}${data.stock_symbol} | ${
                emojis[data.response_value]
            } | ${data.response_length} mins`,
            from: "+17407933281",
            to: "+18046789413",
        })
        .then((message) => console.log(message.sid));
}

module.exports = {
    searchVotes,
};
