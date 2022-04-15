const router = require("express").Router();
const restricted = require("../middleware/restricted");
const { confirmLoginFields, verifyLogin } = require("./users-middleware");
const tokenBuilder = require("../middleware/token-builder");
const Users = require("./users-model");

router.post("/", confirmLoginFields, verifyLogin, (req, res, next) => {
    const { phone_number } = req.body;
    Users.insertUser(phone_number)
        .then((user) => {
            const token = tokenBuilder(user);
            const user_id = user.user_id;
            res.status(201).json({
                message: `Sign up successful`,
                user_id,
                token,
            });
        })
        .catch(next);
});

router.get("/:user_id", restricted, (req, res, next) => {
    const { user_id } = req.params;
    Users.getUserById(user_id)
        .then((user) => {
            const user_id = user.user_id;
            if (user_id) {
                res.status(200).json({
                    message: `Token verified and user found`,
                    user_id,
                });
            } else {
                res.status(404).json({
                    message: `User not found, please login`,
                });
            }
        })
        .catch(next);
});

module.exports = router;
