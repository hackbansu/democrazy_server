const mysql = require('mysql');
const db = require('../db');
const pool = db.pool;


//function to serve opinion polls (after a date and id of desired state(+ central))
//with specified details
//params = {dateAfterwards: String, OP_id, stateId, details: array, count, cb: function}
function getNewOpinionPolls(dateAfterwards, OP_id, stateId, details, count, cb) {
    let sql = 'SELECT ?? FROM opinion_polls WHERE id > ? AND date_end > ? ' +
        'AND state_central_id IN (1, ?) LIMIT 0,? ';

    pool.getConnection(function (err, connection) {
        if (err) {
            return cb(err, null);
        }
        connection.query(sql, [details, OP_id, dateAfterwards, stateId, count], function (err, result, fields) {
            connection.release();
            if (err) {
                return cb(err, null);
            }
            return cb(null, result);
        })
    })
}

//function to serve stateIds for OPIds
//params = {OPIds: array, cb: function}
function getStateIdsForOPIds(OPIds, cb) {
    let sql = 'SELECT DISTINCT state_central_id FROM opinion_polls WHERE id IN (?) ORDER BY state_central_id ';

    pool.getConnection(function (err, connection) {
        if (err) {
            return cb(err, null);
        }
        connection.query(sql, [OPIds], function (err, result, fields) {
            connection.release();
            if (err) {
                return cb(err, null);
            }
            return cb(null, result);
        })
    })
}


//function to add new opinion polls
//params = {data: array of identity Objects, cb: function}
function addNewOpinionPolls(data, cb) {
    let sql = "INSERT INTO opinion_polls (question, state_central_id, date_start, date_end) VALUES ";
    for (let i = 0; i < data.length; i++) {
        let obj = data[i];
        sql += "(" + mysql.escape(obj['question']) + ", " + mysql.escape(obj['SCId']) + ", "
            + mysql.escape(obj['dateStart']) + ", " + mysql.escape(obj['dateEnd']) + ")";
        if (i !== data.length - 1) {
            sql += ", "
        }
    }

    pool.getConnection(function (err, connection) {
        if (err) {
            return cb(err, null);
        }
        connection.query(sql, function (err, result, fields) {
            connection.release();
            if (err) {
                return cb(err, null);
            }
            return cb(null, result);
        })
    })
}


module.exports = {
    getNewOpinionPolls,
    getStateIdsForOPIds,
    addNewOpinionPolls
};