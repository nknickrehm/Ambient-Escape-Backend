const express = require('express');
const router = express.Router();

/* GET REQUESTS */
/**
 * @api {get} /players/ Get all players
 * @apiName GetAllPlayers
 * @apiVersion 1.0.0
 * @apiGroup Players
 * @apiHeader (Needed Request Headers) {String} Content-Type application/json
 *
 * @apiSuccess {Array} An array of Players
 *
 * @apiSuccessExample Success-Response:
 *    HTTP/1.1 200 OK
[
    {
        "playerid": 1,
        "gameid": 1,
        "name": "Vorname",
        "mail": "test@test.de",
        "status": "WAITING"
    },
    {
        "playerid": 2,
        "gameid": 1,
        "name": "Vorname",
        "mail": "test@test.de",
        "status": "WAITING"
    }
]
 */
router.route('/').get((req, res) => {
  global.pool.query('SELECT * FROM Player', (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).json(results.rows);
  });
});

/* POST REQUESTS */
/**
 * @api {post} /players/ Create a player
 * @apiName CreatePlayer
 * @apiVersion 1.0.0
 * @apiGroup Players
 * @apiHeader (Needed Request Headers) {String} Content-Type application/json
 * 
 * @apiParam {String} name the name of the player
 * @apiParam {String} mail the mail of the player
 *
 * @apiParamExample {json} Request-Example:
 *    POST /players/
{
	"name": "Vorname",
	"mail": "test@test.de"
}
 * @apiSuccess {Array} An array of Players
 *
 * @apiSuccessExample Success-Response:
 *    HTTP/1.1 201 CREATED
{
    "name": "Vorname",
    "mail": "test@test.de",
    "id": 3
}
 */
router.route('/').post((req, res) => {
  //TODO: Always use latest active game instead of ID 1
  global.pool.query(
    "INSERT INTO Player (GameID, Name, Mail, Status) VALUES (1, $1, $2, 'test') RETURNING PlayerId",
    [req.body.name, req.body.mail],
    (error, results) => {
      if (error) {
        throw error;
      }

      req.body['id'] = results.rows[0].playerid;

      global.io.emit('players', req.body); // send socket message
      res.status(201).json(req.body);
    },
  );
});

module.exports = router;
