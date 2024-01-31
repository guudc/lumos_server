"use strict"

const express = require("express")
const { createServer } = require('node:http');
const route = require("./src/routes/routes.js") 
const app = express()
const { Server } = require("socket.io");
const { connect } = require("./src/controllers/socket.js");

app.use("/", route)
const server = createServer(app);
const io = new Server(server, {cors: {
    origin: "*",
}});

let port = process.env.PORT || 4000
server.listen(port, () => {
    console.log('server running at port ' + port);
});
io.on('connection', (socket) => {
    connect(socket, io)
});

 
