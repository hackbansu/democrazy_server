const mysql = require('mysql');
const db = require('../db');
const pool = db.pool;


//function to serve specified details of questions
//params = {identity: Object, details: array, cb: function}
function getQuestion(identity, details, cb) {
    let sql = "SELECT ?? FROM bill_ordinance_question ";
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

//function to add question to the table
//params = {identity: Object, cb: function}
function addQuestion(identity, cb) {
    let sql = "INSERT INTO bill_ordinance_question SET ? ";

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
    getQuestion,
    addQuestion
};