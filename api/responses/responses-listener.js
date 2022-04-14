const { Client } = require("pg");
const Responses = require("./responses-model");
const Twilio = require("../twilio/send_sms");

let dbURL = "";

if (process.env.NODE_ENV === "development") {
    dbURL = process.env.DEV_DATABASE_URL;
} else if (process.env.NODE_ENV === "testing") {
    dbURL = process.env.TESTING_DATABASE_URL;
} else {
    dbURL = process.env.DATABASE_URL;
}

const client = new Client({
    connectionString: dbURL,
});

function listenForUpdates() {
    //eslint-disable-next-line
    client.connect((err, client, done) => {
        if (err) {
            console.log("Error connecting to database: ", err);
        } else {
            console.log("Listening for updates and inserts to db...");
            client.on("notification", (msg) => {
                const response = JSON.parse(msg.payload);
                if (response.response_id) {
                    Responses.checkInResponsePairs(response)
                        .then(async (res) => {
                            res
                                ? await Promise.all(
                                      res.map(async (pair) => {
                                          const userResponseId = pair[0];
                                          const opponentResponseId = pair[1];
                                          await Twilio.triggerExpiredNotification(
                                              userResponseId,
                                              opponentResponseId
                                          );
                                      })
                                  )
                                : console.log(
                                      "no response pair for this response: ",
                                      response.response_id
                                  );
                        })
                        .catch((err) => {
                            console.error(err);
                        });
                } else {
                    Responses.getResponsePairSMSData(response)
                        .then(async (res) => {
                            await Twilio.triggerResponsePairNotification(
                                res.primary_response,
                                res.secondary_response,
                                "primary"
                            );
                            await Twilio.triggerResponsePairNotification(
                                res.secondary_response,
                                res.primary_response,
                                "secondary"
                            );
                        })
                        .catch((err) => {
                            console.error(err);
                        });
                }
            });
            //eslint-disable-next-line
            const query = client.query("LISTEN update_notification");
        }
    });
}

module.exports = {
    listenForUpdates,
};
