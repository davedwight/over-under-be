const Users = require("./users-model");
const tokenBuilder = require("../middleware/token-builder");

const confirmLoginFields = (req, res, next) => {
    const { phone_number } = req.body;
    if (!phone_number || phone_number.trim() === null) {
        res.status(422).json({
            message: `Phone number required`,
        });
    } else {
        next();
    }
};

const verifyLogin = (req, res, next) => {
    const { phone_number } = req.body;

    Users.getUserByPhone(phone_number)
        .then((user) => {
            if (user) {
                const token = tokenBuilder(user);
                const user_id = user.user_id;
                res.json({
                    message: `Login successful`,
                    user_id,
                    token,
                });
            } else {
                next();
            }
        })
        .catch((err) => console.error(err));
};

module.exports = {
    confirmLoginFields,
    verifyLogin,
};
