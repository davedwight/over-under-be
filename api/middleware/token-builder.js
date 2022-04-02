const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../secrets");

function tokenBuilder(user) {
    const payload = {
        subject: user.user_id,
        phone_number: user.phone_number,
    };
    const options = {
        expiresIn: "30d",
    };
    const token = jwt.sign(payload, JWT_SECRET, options);
    return token;
}

module.exports = tokenBuilder;
