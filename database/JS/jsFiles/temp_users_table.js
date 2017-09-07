const mysql = require('mysql');
const db = require('../db');
const pool = db.pool;

//function to serve a temporary user's specified details
//params = {identity: Object, details: array, cb: function}
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
//params = {identity: Object, cb:function}
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
//params = {identity: Object, cb: function}
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

//function to remove previous events and create a new mysql event to discard otp after 3 minutes
//params = {identity: Object, cb: function}
function setNewOtpTimeout(identity, cb) {
    let eventName = 'otp_timeout_' + identity['phone'];
    let sql = 'DROP EVENT IF EXISTS ' + eventName;

    pool.getConnection(function (err, connection) {
        if (err) {
            return cb(err, null);
        }
        connection.query(sql, function (err, result, fields) {
            if (err) {
                return cb(err, null);
            }
            sql = 'CREATE EVENT ' + eventName + ' ' +
                'ON SCHEDULE AT CURRENT_TIMESTAMP + INTERVAL 3 MINUTE ' +
                'DO ' +
                'DELETE FROM temp_users WHERE phone = ?';
            connection.query(sql, [identity['phone']], function (err, result, fields) {
                connection.release();
                if (err) {
                    return cb(err, null);
                }
                return cb(null, result);
            })
        })
    })
}

//function to run mysql event to discard otp
//params = {identity: Object (phone), cb: function}
function runOtpTimeoutNow(identity, cb) {
    let eventName = 'otp_timeout_' + identity['phone'];
    let sql = 'ALTER EVENT ' + eventName + " " +
        'ON SCHEDULE AT CURRENT_TIMESTAMP';

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
    getUsersDetails,
    deleteUsers,
    createOrUpdateUser,
    setNewOtpTimeout,
    runOtpTimeoutNow
};