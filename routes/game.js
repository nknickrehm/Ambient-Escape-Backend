
const express = require("express");
const router = express.Router();

/* GET REQUESTS */
router.route("/").get((req, res) => {
    global.pool.query("SELECT * FROM Game", (error, results) => {
        if (error) {
            throw error;
        }
        res.status(200).json(results.rows);
    });
});

/* POST REQUESTS */
router.route("/").post((req, res) => {
    global.pool.query("INSERT INTO Game (Status) VALUES ('NOT STARTED') RETURNING GameId", 
            [], (error, results) => {
        if (error) {
            throw error;
        }

        //TODO: Stop all running games?
        //TODO: Add Riddles
        req.body["id"] = results.rows[0].gameid;
        global.io.emit("games", req.body); // send socket message
        res.status(201).json(req.body);
    });
});

/* PATCH REQUESTS */
router.route("/:gameid/Status").patch((req, res) => {
    global.pool.query("UPDATE Game SET Status=$1 WHERE GameId=$2", [req.body.status, req.params['gameid']], 
            (error, results) => {
        if (error) {
            throw error;

        }

        global.io.emit("games", {"type": "changed", "id":req.params['gameid']});
        res.status(201).json(req.body);
    });
});

 
module.exports = router;