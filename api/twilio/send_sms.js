require("dotenv").config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);
const Responses = require("../responses/responses-model");
const moment = require("moment");
const PNF = require("google-libphonenumber").PhoneNumberFormat;
const phoneUtil =
    require("google-libphonenumber").PhoneNumberUtil.getInstance();

let result = "";

const emojis = {
    over: "📈",
    under: "📉",
};

function triggerExpiredNotification(userResponseId, opponentResponseId) {
    Responses.getExpiredSMSData(userResponseId, opponentResponseId)
        .then((res) => {
            console.log("result from getSMSData", res);
            if (
                res.userData.end_price > res.userData.start_price &&
                res.userData.response_value === "over"
            ) {
                result = "won";
            } else if (
                res.userData.end_price < res.userData.start_price &&
                res.userData.response_value === "under"
            ) {
                result = "won";
            } else if (res.userData.end_price === res.userData.start_price) {
                result = "tied";
            } else {
                result = "lost";
            }

            const messageData = {
                result,
                stock_symbol: res.userData.stock_symbol,
                response_value: res.userData.response_value,
                response_length: res.userData.response_length,
                opponent_phone_number: res.opponentData.phone_number,
                phone_number: res.userData.phone_number,
            };

            return sendExpiredSMS(messageData);
        })
        .catch((err) => {
            console.error(err);
        });
}

function sendExpiredSMS(data) {
    const number = phoneUtil.parseAndKeepRawInput(
        data.opponent_phone_number,
        "US"
    );
    const formattedOpponentNum = phoneUtil.format(number, PNF.NATIONAL);
    const expiredMessages = {
        won: `Congrats! You won this OVER / UNDER against ${formattedOpponentNum}.\n`,
        lost: `Bummer. You lost this OVER / UNDER against ${formattedOpponentNum}.\n`,
        tied: `It's a tie! You tied ${formattedOpponentNum}. The price of this OVER / UNDER didn't change.\n`,
    };
    console.log(
        `${expiredMessages[data.result]}${data.stock_symbol} | ${
            emojis[data.response_value]
        } | ${data.response_length} mins`
    );
    return client.messages
        .create({
            body: `${expiredMessages[data.result]}${data.stock_symbol} | ${
                emojis[data.response_value]
            } | ${data.response_length} mins`,
            from: "+17407933281",
            to: data.phone_number,
        })
        .then((message) => console.log(message.sid));
}

function triggerResponsePairNotification(
    userData,
    opponentData,
    messageVersion
) {
    const now = moment();
    const expTime = moment(userData.expiration_time);
    const minsRemaining = expTime.diff(now, "minutes");
    const number = phoneUtil.parseAndKeepRawInput(
        opponentData.phone_number,
        "US"
    );
    const formattedOpponentNum = phoneUtil.format(number, PNF.NATIONAL);

    const responsePairMessages = {
        primary: `It's on! ${formattedOpponentNum} took the other side (${opponentData.response_value}) on this OVER / UNDER, which expires in ${minsRemaining} mins.\n`,
        secondary: `It's on! You took the other side (${userData.response_value}) of ${formattedOpponentNum}'s bet on this OVER / UNDER, which expires in ${minsRemaining} mins.\n`,
    };

    const messageData = {
        message: responsePairMessages[messageVersion],
        stock_symbol: userData.stock_symbol,
        response_value: userData.response_value,
        response_length: userData.response_length,
        phone_number: userData.phone_number,
    };

    sendResponsePairSMS(messageData);
}

function sendResponsePairSMS(data) {
    console.log(
        `${data.message}${data.stock_symbol} | ${
            emojis[data.response_value]
        } | ${data.response_length} mins`
    );
    return client.messages
        .create({
            body: `${data.message}${data.stock_symbol} | ${
                emojis[data.response_value]
            } | ${data.response_length} mins`,
            from: "+17407933281",
            to: data.phone_number,
        })
        .then((message) => console.log(message.sid));
}

module.exports = {
    triggerExpiredNotification,
    triggerResponsePairNotification,
};
