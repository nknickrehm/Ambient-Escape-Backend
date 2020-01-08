const express = require('express');
const router = express.Router();

/* GET REQUESTS */
/**
 * @api {get} /riddles/ Get all riddles
 * @apiName GetAllRiddles
 * @apiVersion 1.0.0
 * @apiGroup Riddles
 * @apiHeader (Needed Request Headers) {String} Content-Type application/json
 *
 * @apiSuccess {Array} An array of Riddles
 *
 * @apiSuccessExample Success-Response:
 *    HTTP/1.1 200 OK
[
    {
        "riddleid": 1,
        "gameid": 1,
        "progress": 0,
        "name": "A",
        "status": "WAITING"
    },
    {
        "riddleid": 2,
        "gameid": 1,
        "progress": 0,
        "name": "B",
        "status": "WAITING"
    }
]
 */
router.route('/').get((req, res) => {
  global.pool.query('SELECT * FROM Riddle', (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).json(results.rows);
  });
});

/**
 * @api {get} /riddles/names/:name Get the newest ID of the riddle with given name
 * @apiName GetRiddleId
 * @apiVersion 1.0.0
 * @apiGroup Riddles
 * @apiHeader (Needed Request Headers) {String} Content-Type application/json
 *
 * @apiParam {String} name the name of the riddle to search
 * 
 * @apiSuccess {Array} An array of Riddles
 *  
 * @apiError 404 A riddle with this name was not found
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *

 * @apiSuccessExample Success-Response:
 *    HTTP/1.1 200 OK
[
    {
        "riddleid": 2
    }
]
 */
router.route('/names/:name').get((req, res) => {
  global.pool.query(
    'SELECT MAX(RiddleId) as RiddleId FROM Riddle WHERE Name=$1',
    [req.params['name']],
    (error, results) => {
      if (error) {
        throw error;
      }
      if (results.rows[0].riddleid === null) {
        res.status(404).send();
        return;
      }
      res.status(200).json(results.rows);
    },
  );
});

/**
 * @api {get} /riddles/:riddleid/Codes Get all codes affecting the given riddle
 * @apiName GetRiddleCodes
 * @apiVersion 1.0.0
 * @apiGroup Riddles
 * @apiHeader (Needed Request Headers) {String} Content-Type application/json
 *
 * @apiParam {Number} riddleid the id of the riddle to search for
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
        "senderriddleid": 3,
        "receiverriddleid": 2,
        "key": "123",
        "value": "geheim",
        "status": "READY"
    },
]
 */
router.route('/:riddleid/Codes').get((req, res) => {
  global.pool.query(
    'SELECT * FROM Code WHERE ReceiverRiddleID=$1',
    [req.params['riddleid']],
    (error, results) => {
      if (error) {
        throw error;
      }

      res.status(200).json(results.rows);
    },
  );
});

/* POST REQUESTS */
// No POST to riddles, since these will probably be hardcoded

/* PATCH REQUESTS */
/**
 * @api {patch} /riddles/:riddleid/Status Update a riddle status
 * @apiName UpdateRiddleStatus
 * @apiVersion 1.0.0
 * @apiGroup Riddles
 * @apiHeader (Needed Request Headers) {String} Content-Type application/json
 * 
 * @apiParam {Number} riddleid the id of the riddle to change
 * @apiParam {String} status is the new status of this riddle
 *
 * @apiParamExample {json} Request-Example:
 *    PATCH /codes/riddles/1/Status
{
	"status": "READY"
}
 * @apiSuccess {Object} The changed riddle attributes
 *
 * @apiSuccessExample Success-Response:
 *    HTTP/1.1 201 CREATED
{
    "status": "READY"
}
 */
router.route('/:riddleid/Status').patch((req, res) => {
  global.pool.query(
    'UPDATE Riddle SET Status=$1 WHERE RiddleId=$2',
    [req.body.status, req.params['riddleid']],
    (error, results) => {
      if (error) {
        throw error;
      }

      //TODO: Check ready state conditions (e.g. are all riddles completed?)
      global.io.emit('riddles', { type: 'changed', id: req.params['riddleid'] });
      res.status(201).json(req.body);
    },
  );
});

/* PATCH REQUESTS */
/**
 * @api {patch} /riddles/:riddleid/progress/:progress? Update progress of a riddle
 * @apiName UpdateRiddleProgress
 * @apiVersion 1.0.0
 * @apiGroup Riddles
 * @apiHeader (Needed Request Headers) {String} Content-Type application/json
 *
 * @apiParam {Number} riddleid the id of the riddle to change
 * @apiQueryParam {Number} progress the progress set to
 *
 * @apiParamExample {json} Request-Example:
 *    PATCH /riddles/2/progress/?progress=80
 *
 * @apiSuccessExample Success-Response:
 *    HTTP/1.1 201 CREATED
 */
router
  .route('/:riddleid/progress/:progress?')
  .patch(async ({ params: { riddleid }, query: { progress } }, res) => {
    let gameid;
    try {
      const { rows } = await global.pool.query(
        'SELECT  GameId from Game ORDER BY GameId DESC LIMIT 1',
        [],
      );
      gameid = rows[0].gameid;
    } catch (err) {
      throw err;
    }
    console.log(gameid);
    const updatedRiddle = await global.pool.query(
      'UPDATE Riddle SET progress=$1 WHERE RiddleId=$2 AND gameid=$3',
      [progress, riddleid, gameid],
    );
    const updatedGroup = await global.pool.query(
      'SELECT name, progress FROM Riddle WHERE RiddleId=$1 AND GameId=$2',
      [riddleid, gameid],
    );
    global.io.emit('riddles/updateProgress', updatedGroup.rows[0]);
    return res.status(201).end();
  });

module.exports = router;
