const express = require("express");
const app = express();
global.app = app;

const server = require("http").Server(app);
global.server = server;
const io = require("socket.io")(server);
global.io = io;

const bodyParser = require("body-parser");
const ip = require("ip");
const colors = require("colors"); // allows for using colors as attribute of strings
const playerRoutes = require('./routes/player');

const fileUpload = require("express-fileupload");

app.use(express.static("./public"));
app.use(bodyParser.json());
app.use(fileUpload());

app.use('/players/', playerRoutes);


 
/* start server */
var port = 8080;
server.listen(port, () => {
    console.log(`Server is running on ${ip.address().green}`);
})