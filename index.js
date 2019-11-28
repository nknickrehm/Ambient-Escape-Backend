const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const bodyParser = require("body-parser");
const ip = require("ip");
const colors = require("colors"); // allows for using colors as attribute of strings

const fileUpload = require("express-fileupload");

app.use(express.static("./public"));
app.use(bodyParser.json());
app.use(fileUpload());

var players = [];

/* GET REQUESTS */
app.get("/players", (req, res) => {
    res.send(players);
})

/* POST REQUESTS */
app.post("/players", (req, res) => {
    players.push(req.body);

    io.emit("players", req.body); // send socket message
    res.send(req.body); // send response for this request
})

/* start server */
var port = 80;
server.listen(port, () => {
    console.log(`Server is running on ${ip.address().green}`);
})