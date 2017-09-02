const mysql = require('mysql');
const db = require('../db');
const pool = db.pool;

function getAllStates(cb) {
    pool.getConnection(function (err, connection) {
        if (err) {
            return cb(err, null);
        }

        connection.query('SELECT * FROM states', function (err, result, fields) {
            connection.release();
            if (err) {
                return cb(err, null);
            }
            return cb(null, result);
        })
    })
}

module.exports = {
    getAllStates,
};