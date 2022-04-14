require("dotenv").config();
const Listener = require("./api/responses/responses-listener");

const server = require("./api/server");

const port = process.env.PORT;

Listener.listenForUpdates();

server.listen(port, () => {
    console.log("listening on " + port);
});
