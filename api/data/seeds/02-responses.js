exports.seed = function (knex) {
    return knex("responses").insert([
        {
            user_id: 1,
            stock_symbol: "AAPL",
            stock_name: "Apple, Inc.",
            current_price: 172.56,
            response_value: "over",
            expiration_time: "2022-03-17T00:00:00.000Z",
            response_length: 15,
        },
        {
            user_id: 2,
            stock_symbol: "TSLA",
            stock_name: "Tesla",
            current_price: 420.69,
            response_value: "under",
            expiration_time: "2022-03-17T08:00:00.000Z",
            response_length: 60,
        },
        {
            user_id: 3,
            stock_symbol: "TSLA",
            stock_name: "Tesla",
            current_price: 420.69,
            response_value: "over",
            expiration_time: "2022-03-17T08:00:00.000Z",
            response_length: 60,
        },
    ]);
};
