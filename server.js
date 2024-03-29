"use strict"
const fs = require('fs');
const express = require("express")
const { createServer } = require('node:https');
const route = require("./src/routes/routes.js") 
const app = express()
const { Server } = require("socket.io");
const { connect } = require("./src/controllers/socket.js");

app.use("/", route)
// Certificate
 const privateKey = fs.readFileSync('/etc/letsencrypt/live/nsh16.lumosdao.io/privkey.pem', 'utf8');
 const certificate = fs.readFileSync('/etc/letsencrypt/live/nsh16.lumosdao.io/cert.pem', 'utf8');
 const ca = fs.readFileSync('/etc/letsencrypt/live/nsh16.lumosdao.io/chain.pem', 'utf8');
 const credentials = {
 	key: privateKey,
 	cert: certificate,
 	ca: ca
 };

const server = createServer(credentials, app);
const io = new Server(server, {cors: {
    origin: "*",
}});

// // Starting both http & https servers
 // const httpsServer = https.createServer(credentials, app);
 // httpsServer.listen(443, () => {
 // 	console.log('HTTPS Server running on port 443');
 // });

let port = process.env.PORT || 443
server.listen(port, () => {
    console.log('server running at port ' + port);
});
io.on('connection', (socket) => {
    connect(socket, io)
});

 
