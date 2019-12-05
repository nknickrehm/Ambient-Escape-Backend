const {Router} = require('express');

const router = Router();

/* GET ROUTES*/
/**
 * @api {GET} /riddleEvent/ get all RiddleEvents
 * @apiName GetRiddleEvent
 * @apiVersion 1.0.0
 * @apiGroup riddleEvents
 *
 * @apiSuccess {Array} Array of RiddleEvents
 *
 * @apiSuccessExample Success-Response
 * HTTP/1.1 201 OK 
 [
  {
    "riddleeventid": 1,
    "riddleid": 1,
    "type": "something",
    "timestamp": "2019-12-02T11:28:01.336Z",
    "data": "Karte s7 wurde eingelesen"
},
  {
    "riddleeventid": 1,
    "riddleid": 2,
    "type": "something",
    "timestamp": "2019-12-02T11:28:01.336Z",
    "data": "Das Rätsel wurde gelöst"
  },
 ]
 */
router.route('/').get((req, res) => {
  global.pool.query('SELECT * FROM RiddleEvent', [], (err, result) => {
    if (err) {
      throw err;
    } else {
      res.status(200).send(result.rows);
    }
  });
});

/* POST REQUESTS*/
/**
 * @api {post} /riddleEvent/:riddleID Create a RiddleEvent
 * @apiName CreateRiddleEvent
 * @apiVersion 1.0.0
 * @apiGroup riddleEvents
 * @apiHeader (needed Request Headers) {String} Content-Type application/json
 *
 * @apiSuccess {Object} StatusCode
 *
 * @apiSuccessExample Success-Response
 * HTTP/1.1 201 OK {"id": "30"}
 */
router.route('/:riddleID').post(async ({body: {data, type}, params: {riddleID}}, res) => {
  // write into db
  let insertResult;
  let newTimestamp;
  let newRiddleEventGroup;
  // insert the new event into the db
  try {
    insertResult = await global.pool.query(
      'INSERT INTO RiddleEvent (RiddleID, Type, Data, Timestamp) VALUES ($1, $2, $3, current_timestamp) RETURNING RiddleEventID',
      [parseInt(riddleID), type, data],
    );
  } catch (err) {
    throw err;
  }
  // get the timestamp of the new event
  try {
    newTimestamp = await global.pool.query(
      'SELECT timestamp FROM RiddleEvent WHERE riddleeventid = $1',
      [insertResult.rows[0].riddleeventid],
    );
  } catch (err) {
    throw err;
  }
  // get the name of the riddleGroup
  try {
    newRiddleEventGroup = await global.pool.query('SELECT Name FROM Riddle WHERE RiddleID = $1', [
      parseInt(riddleID),
    ]);
  } catch (err) {
    throw err;
  }
  // emit data to the socket
  global.io.emit('newLogEntry', {
    groupID: newRiddleEventGroup.rows[0].name,
    data,
    type,
    timestamp: newTimestamp.rows[0].timestamp,
  });
  // return response with the riddleventid
  return res.status(201).send({riddleeventid: insertResult.rows[0].riddleeventid});
});

module.exports = router;
