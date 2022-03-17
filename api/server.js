const express = require("express");
const router = require("./router");
const helmet = require("helmet");
const cors = require("cors");

const server = express();
server.use(express.json());
server.use(helmet());
server.use(cors());
server.use("/api", router);

// eslint-disable-next-line
server.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).json({
        message: err.message,
        stack: err.stack,
    });
});

module.exports = server;
