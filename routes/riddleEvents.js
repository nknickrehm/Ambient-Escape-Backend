const {Router} = require('express');

const router = Router();

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
 * HTTP/1.1 201 OK {"success": "added event to log"}
 */
router.route('/:riddleID').post(({body: {data, type}, params: {riddleID}}, res) => {
  // write into db
  global.pool.query(
    'INSERT INTO RiddleEvent (RiddleID, Type, Data, Timestamp) VALUES ($1, $2, $3, current_timestamp) RETURNING RiddleEventID',
    [parseInt(riddleID), type, data],
    (err, result) => {
      if (err) {
        throw err;
      }
    },
  );
  // get riddle group and send response
  global.pool.query(
    'SELECT Description FROM Riddle WHERE RiddleID = $1',
    [parseInt(riddleID)],
    (err, {rows}) => {
      if (err) {
        throw err;
      } else {
        global.io.emit('newLogEntry', {groupID: rows[0].description, data, type});
        return res.status(201).send({success: 'added event to log'});
      }
    },
  );
});

module.exports = router;
