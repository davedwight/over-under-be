const db = require("../data/db-config");

async function insertResponse(response) {
    const responseToInsert = {
        user_id: response.user_id,
        stock_symbol: response.stock_symbol,
        stock_name: response.stock_name,
        response_length: response.response_length,
        response_value: response.response_value,
        current_price: response.current_price,
        expiration_time: response.expiration_time,
        created_at: response.created_at,
    };

    const [newResponseObject] = await db("responses").insert(responseToInsert, [
        "response_id",
        "user_id",
        "stock_symbol",
        "stock_name",
        "response_length",
        "response_value",
        "current_price",
        "created_at",
        "expiration_time",
    ]);

    if (response.primary_response) {
        await db("response_pairs").insert({
            primary_response_id: response.primary_response,
            secondary_response_id: newResponseObject.response_id,
        });
    }

    return newResponseObject;
}

async function getResponseById(id) {
    const responseObject = await db("responses as r").where(
        "r.response_id",
        id
    );
    return responseObject;
}

module.exports = {
    insertResponse,
    getResponseById,
};
