
const express = require("express");
const router = express.Router();

var players = [];

/* GET REQUESTS */
router.route("/").get((req, res) => {
    res.send(players);
});

/* POST REQUESTS */
router.route("/").post((req, res) => {
    players.push(req.body);

    console.log("emitting ", req);
    global.io.emit("players", req.body); // send socket message
    res.send(req.body); // send response for this request
});


module.exports = router;