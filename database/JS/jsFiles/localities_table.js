const mysql = require('mysql');
const db = require('../db');
const pool = db.pool;

//function to serve localities
//params = {identity: object, details: array, cb: function}
function getLocalities(identity, details, cb) {
    let sql = 'SELECT ?? FROM localities ';
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


module.exports = {
    getLocalities
};