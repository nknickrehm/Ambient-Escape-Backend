const express = require('express');
const router = express.Router();

/* GET REQUESTS */
/**
 * @api {get} /storylines/ Get all Storyline
 * @apiName GetAllStorylines
 * @apiVersion 1.0.0
 * @apiGroup Storyline
 * @apiHeader (Needed Request Headers) {String} Content-Type application/json
 *
 * @apiSuccess {Array} An array of Storylines
 *
 * @apiSuccessExample Success-Response:
 *    HTTP/1.1 200 OK
[
    {
        "storylineid": 1,
        "gameid": 1,
        "storyline": 1,
    },
    {
        "storylineid": 2,
        "gameid": 2,
        "storyline": 1,
    }
]
 */
router.route('/').get((req, res) => {
  global.pool.query('SELECT * FROM Storyline', (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).json(results.rows);
  });
});

/* POST REQUESTS */
/**
 * @api {post} /storylines/ Create a Storyline
 * @apiName CreateStoryline
 * @apiVersion 1.0.0
 * @apiGroup Storyline
 * @apiHeader (Needed Request Headers) {String} Content-Type application/json
 *
 * @apiParam {Int} the storyline integer value
 *
 * @apiParamExample {json} Request-Example:
 *    POST /storylines/
{
	"storyline": 1,
}
 * @apiSuccess {Object} The created storyline
 *
 * @apiSuccessExample Success-Response:
 *    HTTP/1.1 200 OK
{
    "id": 3
}
 */
router.route('/').post((req, res) => {
  global.pool.query(
    'INSERT INTO Storyline (storyline) VALUES ($1) RETURNING storylineid',
    [req.body.storyline],
    (error, results) => {
      if (error) {
        throw error;
      }

      req.body['id'] = results.rows[0].storylineid;
      global.io.emit('storylineSelected', req.body); // send socket message
      res.status(201).json(req.body);
    },
  );
});

module.exports = router;
