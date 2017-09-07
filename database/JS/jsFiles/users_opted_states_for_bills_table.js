const mysql = require('mysql');
const db = require('../db');
const pool = db.pool;


//function to serve entries with specified details
//params = {identity: Object, details: array, cb: function}
function getEntries(identity, details, cb) {
    let sql = 'SELECT ?? FROM users_opted_states_for_bills ';
    sql = db.addWhereClause(sql, identity);

    pool.getConnection(function (err, connection) {
        if (err) {
            return cb(err, null);
        }
        connection.query(sql, [details], function (err, result, fields) {
            connection.release();
            if (err) {
                return cb(err, null);
            }
            return cb(null, result);
        })
    })
}

//function to insert entries (could be more than one) for a user into the table
//params = {userId, SCIds: array of integers, cb: function}
function insertEntries(userId, SCIds, cb) {
    let sql = "INSERT INTO users_opted_states_for_bills (user_id, state_central_id) VALUES ";
    for (let i = 0; i < SCIds.length; i++) {
        sql += "( " + mysql.escape(userId) + ", " + mysql.escape(SCIds[i]) + ") ";
        if (i !== SCIds.length - 1) {
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

//function to delete entries
//params = {identity: Object, cb: function}
function deleteEntries(identity, cb) {
    let sql = "DELETE FROM users_opted_states_for_bills ";
    sql = db.addWhereClause(sql, identity);

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
    insertEntries,
    deleteEntries,
    getEntries,
};