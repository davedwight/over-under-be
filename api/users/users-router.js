const router = require("express").Router();
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

module.exports = router;
