const moment = require("moment");
const expTime = moment().add(30, "minutes").toISOString();

exports.seed = function (knex) {
    return knex("responses").insert([
        {
            user_id: 1,
            stock_symbol: "AAPL",
            stock_name: "Apple, Inc.",
            start_price: 172.56,
            response_value: "over",
            response_length: 15,
            expiration_time: expTime,
            created_at: moment().toISOString(),
            updated_at: moment().toISOString(),
        },
        {
            user_id: 2,
            stock_symbol: "TSLA",
            stock_name: "Tesla",
            start_price: 420.69,
            response_value: "under",
            response_length: 60,
            expiration_time: expTime,
            created_at: moment().toISOString(),
            updated_at: moment().toISOString(),
        },
        {
            user_id: 3,
            stock_symbol: "TSLA",
            stock_name: "Tesla",
            start_price: 420.69,
            response_value: "over",
            response_length: 60,
            expiration_time: expTime,
            created_at: moment().toISOString(),
            updated_at: moment().toISOString(),
        },
    ]);
};
