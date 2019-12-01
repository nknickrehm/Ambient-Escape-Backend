
const express = require("express");
const router = express.Router();

/* GET REQUESTS */
/**
 * @api {get} /games/ Get all codes
 * @apiName GetAllGames
 * @apiVersion 1.0.0
 * @apiGroup Games
 * @apiHeader (Needed Request Headers) {String} Content-Type application/json
 *
 * @apiSuccess {Array} An array of Games
 *
 * @apiSuccessExample Success-Response:
 *    HTTP/1.1 200 OK
[
    {
        "gameid": 1,
        "status": "NOT STARTED",
        "begintime": null,
        "endtime": null
    },
    {
        "gameid": 2,
        "status": "NOT STARTED",
        "begintime": null,
        "endtime": null
    }
]
 */
router.route("/").get((req, res) => {
    global.pool.query("SELECT * FROM Game", (error, results) => {
        if (error) {
            throw error;
        }
        res.status(200).json(results.rows);
    });
});

/* POST REQUESTS */
/**
 * @api {post} /games/ Create a Game
 * @apiName CreateGame
 * @apiVersion 1.0.0
 * @apiGroup Games
 * @apiHeader (Needed Request Headers) {String} Content-Type application/json
 *
 * @apiSuccess {Object} The created game
 *
 * @apiSuccessExample Success-Response:
 *    HTTP/1.1 200 OK
{
    "id": 3
}
 */
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
/**
 * @api {patch} /games/:id/Status Update a game status
 * @apiName UpdateGameStatus
 * @apiVersion 1.0.0
 * @apiGroup Games
 * @apiHeader (Needed Request Headers) {String} Content-Type application/json
 * 
 * @apiParam {Number} id the id of the game to change
 * @apiParam {String} status is the new status of this game
 *
 * @apiParamExample {json} Request-Example:
 *    PATCH /games/1/Status
{
	"status": "READY"
}
 * @apiSuccess {Object} The changed game attributes
 *
 * @apiSuccessExample Success-Response:
 *    HTTP/1.1 201 CREATED
{
    "status": "READY"
}
 */
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