const express = require('express');
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
router.route('/').get((req, res) => {
  global.pool.query('SELECT * FROM Game', (error, results) => {
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
router.route('/').post((req, res) => {
  // stop all running games / set all running games to finished
  global.pool.query('UPDATE GAME SET status=$1 WHERE status=$2 OR status=$3', [
    'FINISHED',
    'NOT STARTED',
    'STARTED',
  ]);
  global.pool.query(
    "INSERT INTO Game (Status) VALUES ('NOT STARTED') RETURNING GameId",
    [],
    (error, results) => {
      if (error) {
        throw error;
      }

      const gameid = results.rows[0].gameid;

      // Create riddle instances for the new game instance
      global.pool.query(
        'INSERT INTO Riddle (GameID, Progress, Name, Status) VALUES ($1, $2, $3, $4), ($5, $6, $7, $8), ($9, $10, $11, $12), ($13, $14, $15, $16)',
        [
          gameid,
          0,
          'A',
          'WAITING',
          gameid,
          0,
          'D',
          'WAITING',
          gameid,
          0,
          'E',
          'WAITING',
          gameid,
          0,
          'F',
          'WAITING',
        ],
        (error, results) => {
          if (error) {
            throw error;
          }
        },
      );

      req.body['id'] = results.rows[0].gameid;
      console.log('emit');
      global.io.emit('games', req.body); // send socket message
      res.status(201).json(req.body);
    },
  );
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
router.route('/:gameid/Status').patch((req, res) => {
  global.pool.query(
    'UPDATE Game SET Status=$1 WHERE GameId=$2',
    [req.body.status, req.params['gameid']],
    (error, results) => {
      if (error) {
        throw error;
      }

      global.io.emit('games', { type: 'changed', id: req.params['gameid'] });
      res.status(201).json(req.body);
    },
  );
});

module.exports = router;
