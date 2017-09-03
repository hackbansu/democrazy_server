const mysql = require('mysql');
const db = require('../db');
const pool = db.pool;

//function to serve a temporary user's specified details
//params = {identity: Object, details: array}
function getUsersDetails(identity, details, cb) {
    let sql = 'SELECT ?? FROM temp_users ';
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

//function to remove temporary users
//params = {identity: Object}
function deleteUsers(identity, cb) {
    let sql = 'DELETE FROM temp_users ';
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

//function to create a temporary user
//params = {identity: Object}
function createOrUpdateUser(identity, cb) {
    let sql = 'INSERT INTO temp_users SET ? ON DUPLICATE KEY UPDATE ?';

    pool.getConnection(function (err, connection) {
        if (err) {
            return cb(err, null);
        }

        connection.query(sql, [identity, identity], function (err, result, fields) {
            connection.release();
            if (err) {
                return cb(err, null);
            }
            return cb(null, result);
        })
    })
}


module.exports = {
    getUsersDetails,
    deleteUsers,
    createOrUpdateUser
};