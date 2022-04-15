const db = require("../data/db-config");
const moment = require("moment");
const ResponseQueries = require("./response-queries");

async function insertResponse(response) {
    const responseToInsert = {
        user_id: response.user_id,
        stock_symbol: response.stock_symbol,
        stock_name: response.stock_name,
        response_length: response.response_length,
        response_value: response.response_value,
        start_price: response.start_price,
        expiration_time: response.expiration_time,
        created_at: response.created_at,
        updated_at: response.updated_at,
    };

    const [newResponseObject] = await db("responses").insert(responseToInsert, [
        "response_id",
        "user_id",
        "stock_symbol",
        "stock_name",
        "response_length",
        "response_value",
        "start_price",
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

async function getResponseUsers(response_id) {
    const usersArr = [];

    const secondaryResponseUsers = await db("response_pairs as rp")
        .join("responses as r", "rp.secondary_response_id", "r.response_id")
        .join("users as u", "r.user_id", "u.user_id")
        .where("rp.secondary_response_id", response_id)
        .select("r.user_id");

    const [primaryUser] = await db("responses as r")
        .where("r.response_id", response_id)
        .select("r.user_id");

    usersArr.push(primaryUser.user_id);

    secondaryResponseUsers.map((userObj) => {
        if (!usersArr.includes(userObj.user_id)) {
            usersArr.push(userObj.user_id);
        }
    });

    return usersArr;
}

async function addEndPrice(id, end_price) {
    const updatedResponse = await db("responses as r")
        .where("r.response_id", id)
        .update({
            end_price,
            updated_at: moment().toISOString(),
        });
    return updatedResponse;
}

async function getExpiredResponses() {
    const now = moment().toISOString();
    const oneSec = moment().add(1, "second").toISOString();
    const responses = await db("responses as r")
        .join("users as u", "r.user_id", "u.user_id")
        .where("r.expiration_time", ">=", now)
        .andWhere("r.expiration_time", "<", oneSec)
        // .andWhere("u.phone_number", "+18046789413")
        .select(
            "u.user_id",
            "u.phone_number",
            "r.response_id",
            "r.stock_symbol",
            "r.stock_name",
            "r.start_price",
            "r.response_length",
            "r.response_value",
            "r.expiration_time",
            "r.created_at"
        );
    return responses;
}

async function checkInResponsePairs(response) {
    const primaryResponsePairs = await db("response_pairs as rp")
        .where("rp.primary_response_id", response.response_id)
        .select("rp.primary_response_id", "rp.secondary_response_id");

    const primaryResponsePairsArr = [];
    primaryResponsePairs.map((obj) => {
        primaryResponsePairsArr.push(Object.values(obj));
    });

    const secondaryResponsePairs = await db("response_pairs as rp")
        .where("rp.secondary_response_id", response.response_id)
        .select("rp.secondary_response_id", "rp.primary_response_id");

    const secondaryResponsePairsArr = [];
    secondaryResponsePairs.map((obj) => {
        secondaryResponsePairsArr.push(Object.values(obj));
    });

    if (primaryResponsePairs.length) {
        return primaryResponsePairsArr;
    } else if (secondaryResponsePairs.length) {
        return secondaryResponsePairsArr;
    }
    return false;
}

async function getExpiredSMSData(userResponseId, opponentResponseId) {
    const [userData] = await db("responses as r")
        .join("users as u", "r.user_id", "u.user_id")
        .where("r.response_id", userResponseId)
        .select(
            "u.phone_number",
            "r.stock_symbol",
            "r.start_price",
            "r.end_price",
            "r.response_value",
            "r.response_length"
        );

    const [opponentData] = await db("responses as r")
        .join("users as u", "r.user_id", "u.user_id")
        .where("r.response_id", opponentResponseId)
        .select("u.phone_number");

    return {
        userData,
        opponentData,
    };
}

async function getResponsePairSMSData(responsePairObj) {
    const [primary_response] = await db("responses as r")
        .join("users as u", "r.user_id", "u.user_id")
        .where("r.response_id", responsePairObj.primary_response_id)
        .select(
            "u.phone_number",
            "r.stock_symbol",
            "r.start_price",
            "r.response_value",
            "r.response_length",
            "r.expiration_time"
        );

    const [secondary_response] = await db("responses as r")
        .join("users as u", "r.user_id", "u.user_id")
        .where("r.response_id", responsePairObj.secondary_response_id)
        .select(
            "u.phone_number",
            "r.stock_symbol",
            "r.start_price",
            "r.response_value",
            "r.response_length",
            "r.expiration_time"
        );

    return {
        primary_response,
        secondary_response,
    };
}

async function getResponsesByUser(userId) {
    const formattedResponses = [];

    const allResponses = await db.raw(ResponseQueries.allResponses(userId));

    allResponses.rows.map((response) => {
        let formattedEndPrice = response.end_price;
        if (response.end_price != "PENDING") {
            formattedEndPrice = parseFloat(response.end_price);
        }
        formattedResponses.push({
            ...response,
            end_price: formattedEndPrice,
        });
    });

    return formattedResponses;
}

module.exports = {
    insertResponse,
    getResponseById,
    getResponseUsers,
    addEndPrice,
    getExpiredResponses,
    checkInResponsePairs,
    getExpiredSMSData,
    getResponsePairSMSData,
    getResponsesByUser,
};
