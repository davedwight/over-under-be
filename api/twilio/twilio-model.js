const db = require("../data/db-config");
const moment = require("moment");

async function getExpiredVotes() {
    const now = moment.utc().format();
    const oneSec = moment().add(1, "second").utc().format();
    const votes = await db("responses as r")
        .join("users as u", "r.user_id", "u.user_id")
        .where("r.expiration_time", ">=", now)
        .andWhere("r.expiration_time", "<", oneSec)
        .andWhere("u.phone_number", "+18046789413")
        .select(
            "u.user_id",
            "u.phone_number",
            "r.stock_symbol",
            "r.stock_name",
            "r.current_price as start_price",
            "r.response_length",
            "r.response_value",
            "r.expiration_time",
            "r.created_at"
        );
    return votes;
}

module.exports = {
    getExpiredVotes,
};
