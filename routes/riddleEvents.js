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
router.route('/:riddleID').post(({body: {data, type}, params: {riddleID}}, res) => {
  // write into db
  global.pool.query(
    'INSERT INTO RiddleEvent (RiddleID, Type, Data, Timestamp) VALUES ($1, $2, $3, current_timestamp) RETURNING RiddleEventID',
    [parseInt(riddleID), type, data],
    (err, result) => {
      if (err) {
        throw err;
      } else {
        // get riddle group and send response
        global.pool.query(
          'SELECT Description FROM Riddle WHERE RiddleID = $1',
          [parseInt(riddleID)],
          (err, {rows}) => {
            if (err) {
              throw err;
            } else {
              global.io.emit('newLogEntry', {groupID: rows[0].description, data, type});
              return res.status(201).send({riddleeventid: result.rows[0].riddleeventid});
            }
          },
        );
      }
    },
  );
});

module.exports = router;
