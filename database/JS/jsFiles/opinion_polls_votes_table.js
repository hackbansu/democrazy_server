const mysql = require('mysql');
const db = require('../db');
const pool = db.pool;


//function to add new votes
//params = {userId, votes: array of object, cb: function}
function addVotes(userId, votes, cb) {
    let dateOfSub = new Date();
    let sql = 'INSERT INTO opinion_polls_votes (user_id, opinion_poll_id, vote, date_of_submission) VALUES ';
    for (let i = 0; i < votes.length; i++) {
        sql += "(" + mysql.escape(userId) + ", " + mysql.escape(votes[i].opinion_poll_id) + ", "
            + mysql.escape(votes[i].vote) + ", " + mysql.escape(dateOfSub) + ")";
        if (i !== votes.length - 1) {
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

//function to get last OP id submitted by a particular user for a particular state
//params = {userId, stateId, cb: function}
function getLastOPIdOfState(userId, stateId, cb) {
    let sql = 'SELECT t1.*, state_central_id ' +
        'FROM (SELECT opinion_poll_id FROM opinion_polls_votes WHERE user_id = ?) as t1 ' +
        'LEFT JOIN opinion_polls ' +
        'ON t1.opinion_poll_id = opinion_polls.id ';
    sql = 'SELECT MAX(t2.opinion_poll_id) AS val FROM ( ' + sql + ') AS t2 WHERE t2.state_central_id = ? ';

    pool.getConnection(function (err, connection) {
        if (err) {
            return cb(err, null);
        }

        connection.query(sql, [userId, stateId], function (err, result, fields) {
            connection.release();
            if (err) {
                return cb(err, null);
            }
            return cb(null, result);
        })
    })
}


//function to update votes
//params = {identity: Object, updates: Object, cb: function}
function updateVotes(identity, updates, cb) {
    let sql = 'UPDATE opinion_polls_votes SET ? ';
    sql = db.addWhereClause(sql, identity);

    pool.getConnection(function (err, connection) {
        if (err) {
            return cb(err, null);
        }
        connection.query(sql, [updates], function (err, result, fields) {
            connection.release();
            if (err) {
                return cb(err, null);
            }
            return cb(null, result);
        })
    })
}

//function to delete (for an identity) all votes greater than OPId
//params = {identity: Object, OPId: integer, cb: function}
function deleteVotes(identity, OPId, cb) {
    let sql = 'DELETE FROM opinion_polls_votes ';
    sql = db.addWhereClause(sql, identity);
    sql += ' and opinion_poll_id > ? ';

    pool.getConnection(function (err, connection) {
        if (err) {
            return cb(err, null);
        }
        connection.query(sql, [OPId], function (err, result, fields) {
            connection.release();
            if (err) {
                return cb(err, null);
            }
            return cb(null, result);
        })
    })
}

module.exports = {
    addVotes,
    getLastOPIdOfState,
    updateVotes,
    deleteVotes
};