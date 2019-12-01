
const express = require("express");
const router = express.Router();

var players = [];

/* GET REQUESTS */
router.route("/").get((req, res) => {
    global.pool.query("SELECT * FROM Player", (error, results) => {
        if (error) {
            throw error;
        }
        res.status(200).json(results.rows);
    });
});

/* POST REQUESTS */
router.route("/").post((req, res) => {
    global.pool.query("INSERT INTO Player (GameID, Name, Mail, Status) VALUES (1, $1, $2, 'test')", [req.body.name, req.body.mail], (error, results) => {
        if (error) {
            throw error;
        }
        global.io.emit("players", req.body); // send socket message
        res.status(201).json({"id":results.insertId});
    });
});


module.exports = router;