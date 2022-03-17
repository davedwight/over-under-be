const express = require("express");
const helpers = require("./model");

const router = express.Router();

router.post("/responses", (req, res, next) => {
    helpers
        .insertResponse(req.body)
        .then((response) => {
            res.status(201).json(response);
        })
        .catch(next);
});

router.get("/responses/:id", (req, res, next) => {
    const { id } = req.params;
    helpers
        .getResponseById(id)
        .then((response) => {
            res.status(200).json(response);
        })
        .catch(next);
});

router.post("/users", (req, res, next) => {
    console.log(req.body);
    helpers
        .insertUser(req.body)
        .then((user) => {
            res.status(201).json(user);
        })
        .catch(next);
});

// router.get("/users", async (req, res) => {
//     res.json(await getAllUsers());
// });

// router.post("/users", async (req, res) => {
//     res.status(201).json(await insertUser(req.body));
// });

module.exports = router;
