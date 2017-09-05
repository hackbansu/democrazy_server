const mysql = require('mysql');
const db = require('../db');
const pool = db.pool;


//function to serve users specified details
//params = {identity: Object, details: array, cb: function}
function getUsersDetails(identity, details, cb) {
    let sql = 'SELECT ?? FROM users ';
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

//function to serve a user's specified details
//params = {identity: Object, updates: Object, cb: function}
function updateUsersDetails(identity, updates, cb) {
    let sql = 'UPDATE users SET ? ';
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

//function to delete a user
//params = {identity: Object, cb: function}
function deleteUsers(identity, cb) {
    let sql = 'DELETE FROM users ';
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

//function to create a new user with specified details
//params = {identity: Object, cb: function}
function createUser(identity, cb) {
    let sql = 'INSERT INTO users SET ? ';

    pool.getConnection(function (err, connection) {
        if (err) {
            return cb(err, null);
        }

        connection.query(sql, [identity], function (err, result, fields) {
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
    updateUsersDetails,
    deleteUsers,
    createUser
};