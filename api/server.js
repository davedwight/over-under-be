const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const restricted = require("./middleware/restricted");

const UsersRouter = require("./users/users-router");
const ResponsesRouter = require("./responses/responses-router");
const { searchVotes } = require("./twilio/send_sms");

const server = express();
server.use(express.json());
server.use(helmet());
server.use(cors());
server.use("/api/users", UsersRouter);
server.use("/api/responses", restricted, ResponsesRouter);

// eslint-disable-next-line
server.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).json({
        message: err.message,
        stack: err.stack,
    });
});

setInterval(() => {
    searchVotes();
}, 1000);

module.exports = server;
