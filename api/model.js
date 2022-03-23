const db = require("./data/db-config");

async function insertResponse(response) {
    const responseToInsert = {
        user_id: response.user_id,
        stock_symbol: response.stock_symbol,
        stock_name: response.stock_name,
        response_length: response.response_length,
        response_value: response.response_value,
        current_price: response.current_price,
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

async function insertUser(user) {
    const [newUserObject] = await db("users").insert(user, [
        "user_id",
        "phone",
    ]);
    return newUserObject;
}

async function getUserById(id) {
    const userObject = await db("users as u").where("u.user_id", id);
    return userObject;
}

// function getAllUsers() {
//     return db("users");
// }

// async function insertUser(user) {
//     // WITH POSTGRES WE CAN PASS A "RETURNING ARRAY" AS 2ND ARGUMENT TO knex.insert/update
//     // AND OBTAIN WHATEVER COLUMNS WE NEED FROM THE NEWLY CREATED/UPDATED RECORD
//     const [newUserObject] = await db("users").insert(user, [
//         "user_id",
//         "username",
//         "password",
//     ]);
//     return newUserObject; // { user_id: 7, username: 'foo', password: 'xxxxxxx' }
// }

module.exports = {
    insertResponse,
    getResponseById,
    insertUser,
    getUserById,
};
