const mysql = require('mysql');
const db = require('../db');
const pool = db.pool;


//function to serve count number of latest bills/ordinances details(id, name , date, state_central_id)
// of given states after an offset
//params = {state_central_ids: array, offset, count, cb: function}
function getBillsAndOrdinances(type, state_central_ids, offset, count, cb) {
    let sql = "SELECT t1.*, states.name AS state FROM ( ";
    sql += 'SELECT id, name, date, state_central_id FROM bills_ordinances ' +
        'WHERE type = ? AND state_central_id IN (?) ORDER BY date desc LIMIT ?,? ';
    sql += ") as t1 LEFT JOIN states ON t1.state_central_id = states.id";
    pool.getConnection(function (err, connection) {
        if (err) {
            return cb(err, null);
        }

        connection.query(sql, [type, state_central_ids, offset, count], function (err, result, fields) {
            connection.release();
            if (err) {
                return cb(err, null);
            }

            return cb(null, result);
        });
    });
}


//function to serve all details of bill/ordinance
//params = {id, cb: function}
function getBillOrdinanceDetails(id, cb) {
    pool.getConnection(function (err, connection) {
        if (err) {
            return cb(err, null);
        }

        let sql = "SELECT t1.*, states.name AS state FROM ( ";
        sql += 'SELECT * FROM bills_ordinances WHERE id = ? ';
        sql += ") as t1 LEFT JOIN states ON t1.state_central_id = states.id ";
        connection.query(sql, [id], function (err, result, fields) {
            connection.release();
            if (err) {
                return cb(err, null);
            }
            return cb(null, result);
        })
    })
}

module.exports = {
    getBillsAndOrdinances,
    getBillOrdinanceDetails
};