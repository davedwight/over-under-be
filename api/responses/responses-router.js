const router = require("express").Router();
const Responses = require("./responses-model");

router.post("/", (req, res, next) => {
    Responses.insertResponse(req.body)
        .then((response) => {
            res.status(201).json(response);
            next();
        })
        .catch((err) => {
            console.error(err);
        });
});

router.get("/:id", (req, res, next) => {
    const { id } = req.params;
    Responses.getResponseById(id)
        .then((response) => {
            res.status(200).json(response);
            next();
        })
        .catch((err) => {
            console.error(err);
        });
});

router.get("/:response_id/users", (req, res, next) => {
    const { response_id } = req.params;
    Responses.getResponseUsers(response_id)
        .then((response) => {
            res.status(200).json(response);
            next();
        })
        .catch((err) => {
            console.error(err);
        });
});

module.exports = router;
