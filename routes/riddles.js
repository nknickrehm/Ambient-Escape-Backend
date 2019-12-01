
const express = require("express");
const router = express.Router();

/* GET REQUESTS */
router.route("/").get((req, res) => {
    global.pool.query("SELECT * FROM Riddle", (error, results) => {
        if (error) {
            throw error;
        }
        res.status(200).json(results.rows);
    });
});

router.route("/names/:name").get((req, res) => {
    global.pool.query("SELECT MAX(RiddleId) as RiddleId FROM Riddle WHERE Name=$1", [req.params['name']], (error, results) => {
        if (error) {
            throw error;
        }
        if (results.rows[0].riddleid === null) {
            res.status(404).send();
            return;
        }
        res.status(200).json(results.rows);
    });
});

router.route("/:riddleid/Codes").get((req, res) => {
    global.pool.query("SELECT * FROM Code WHERE ReceiverRiddleID=$1", [req.params['riddleid']], (error, results) => {
        if (error) {
            throw error;
        }

        res.status(200).json(results.rows);
    });
});

/* POST REQUESTS */
// No POST to riddles, since these will probably be hardcoded

/* PATCH REQUESTS */
router.route("/:riddleid/Status").patch((req, res) => {
    global.pool.query("UPDATE Riddle SET Status=$1 WHERE RiddleId=$2", [req.body.status, req.params['riddleid']], 
            (error, results) => {
        if (error) {
            throw error;

        }

        //TODO: Check ready state conditions
        global.io.emit("riddles", {"type": "changed", "id":req.params['riddleid']});
        res.status(201).json(req.body);
    });
});
 
module.exports = router;