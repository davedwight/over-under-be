const router = require("express").Router();
const Responses = require("./responses-model");

router.post("/", (req, res, next) => {
    Responses.insertResponse(req.body)
        .then((response) => {
            res.status(201).json(response);
        })
        .catch(next);
});

router.get("/:id", (req, res, next) => {
    const { id } = req.params;
    Responses.getResponseById(id)
        .then((response) => {
            res.status(200).json(response);
        })
        .catch(next);
});

module.exports = router;
