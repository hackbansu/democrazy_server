const mysql = require('mysql');
const db = require('../db');
const pool = db.pool;


//function to serve opinion polls (after a date and id of desired state(+ central))
//with specified details
//params = {dateAfterwards: String, OP_id, stateId, details: array, count, cb: function}
function getNewOpinionPolls(dateAfterwards, OP_id, stateId, details, count, cb) {
    let sql = 'SELECT ?? FROM opinion_polls WHERE id > ? AND date_end > ? ' +
        'AND state_central_id IN (0, ?) LIMIT 0,? ';

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
    let sql = 'SELECT DISTINCT state_central_id FROM opinion_polls WHERE id IN (?)';

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


//function to add new opinion poll
//params = {identity: Object, cb: function}
function addNew(ques, identity, cb) {
    let sql = "INSERT INTO opinion_polls (question, state_central_id, date_start, date_end) VALUES ";
    for (let i = 0; i < ques.length; i++) {
        sql += "(" + mysql.escape(ques[i]) + ", " + mysql.escape(identity['state_central_id']) + ", "
            + mysql.escape(identity['date_start']) + ", " + mysql.escape(identity['date_end']) + ")";
        if (i !== ques.length - 1) {
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
    addNew
};