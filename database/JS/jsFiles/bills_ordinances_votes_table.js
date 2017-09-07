const mysql = require('mysql');
const db = require('../db');
const pool = db.pool;


//function to serve specified details of votes
//params = {identity: Object, details: array, cb: function}
function getVotes(identity, details, cb) {
    let sql = "SELECT ?? FROM bills_ordinances_votes ";
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
    getVotes,
};