
const express = require("express");
const router = express.Router();

/* GET REQUESTS */
router.route("/").get((req, res) => {
    global.pool.query("SELECT * FROM Code", (error, results) => {
        if (error) {
            throw error;
        }
        res.status(200).json(results.rows);
    });
});

/* POST REQUESTS */
router.route("/").post((req, res) => {
    global.pool.query("INSERT INTO Code (SenderRiddleID, ReceiverRiddleID, key, value, status) VALUES ($1, $2, $3, $4, $5)", 
            [req.body.sender, req.body.receiver, req.body.key, req.body.value, req.body.status], (error, results) => {
        if (error) {
            throw error;
        }
        global.io.emit("codes", req.body); // send socket message
        res.status(201).json({"id":results.insertId});
    });
});


module.exports = router;