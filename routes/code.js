
const express = require("express");
const router = express.Router();

/* GET REQUESTS */
/**
 * @api {get} /codes/ Get all codes
 * @apiName GetAllCodes
 * @apiVersion 1.0.0
 * @apiGroup Codes
 * @apiHeader (Needed Request Headers) {String} Content-Type application/json
 *
 * @apiSuccess {Array} An array of Codes
 *
 * @apiSuccessExample Success-Response:
 *    HTTP/1.1 200 OK
[
    {
        "codeid": 1,
        "senderriddleid": 1,
        "receiverriddleid": 2,
        "key": "abc",
        "value": "cdef",
        "status": "WAITING"
    },
    {
        "codeid": 2,
        "senderriddleid": 2,
        "receiverriddleid": 1,
        "key": "123",
        "value": "geheim",
        "status": "READY"
    },
]
 */
router.route("/").get((req, res) => {
    global.pool.query("SELECT * FROM Code", (error, results) => {
        if (error) {
            throw error;
        }
        res.status(200).json(results.rows);
    });
});

/* POST REQUESTS */
/**
 * @api {post} /codes/ Create a code
 * @apiName CreateCode
 * @apiVersion 1.0.0
 * @apiGroup Codes
 * @apiHeader (Needed Request Headers) {String} Content-Type application/json
 *
 * @apiParam {Number} sender is the riddle sending this code
 * @apiParam {Number} receiver is the riddle receiving this code
 * @apiParam {String} key is the key of this code
 * @apiParam {String} value is the value of this code
 * @apiParam {String} status is the current status of this code
 *
 * @apiParamExample {json} Request-Example:
{
	"sender": 1,
	"receiver": 2,
	"key": "abc",
	"value": "cdef",
	"status": "WAITING"
}
 * @apiSuccess {Array} An array of Codes
 *
 * @apiSuccessExample Success-Response:
 *    HTTP/1.1 200 OK
[
    {
        "id": 1,
        "senderriddleid": 1,
        "receiverriddleid": 2,
        "key": "abc",
        "value": "cdef",
        "status": "WAITING"
    },
]
 */
router.route("/").post((req, res) => {
    global.pool.query("INSERT INTO Code (SenderRiddleID, ReceiverRiddleID, key, value, status) VALUES ($1, $2, $3, $4, $5) RETURNING CodeId", 
            [req.body.sender, req.body.receiver, req.body.key, req.body.value, req.body.status], (error, results) => {
        if (error) {
            throw error;
        }

        req.body["id"] = results.rows[0].codeid;
        global.io.emit("codes", req.body); // send socket message
        res.status(201).json(req.body);
    });
});


module.exports = router;