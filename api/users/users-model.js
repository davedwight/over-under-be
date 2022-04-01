const db = require("../data/db-config");

async function insertUser(user_phone_number) {
    const [newUserObject] = await db("users").insert(
        { phone_number: user_phone_number },
        ["user_id", "phone_number"]
    );
    return newUserObject;
}

async function getUserById(id) {
    const [userObject] = await db("users as u").where("u.user_id", id);
    return userObject;
}

async function getUserByPhone(phone) {
    const [userObject] = await db("users as u").where("u.phone_number", phone);
    return userObject;
}

module.exports = {
    insertUser,
    getUserById,
    getUserByPhone,
};
