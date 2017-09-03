const db = require('../../../database/JS/db');
const express = require('express');
const route = express.Router();

//function to send user details
//req.query = {}
route.get('/getDetails', function (req, res) {
    let id = req['user']['id'];

    db.users_table.getUsersDetails({id: id}, ['*'], function (err, result) {
        if (err) {
            console.log(err);
            return res.status(404).json({status: false, msg: "error in database"});
        }
        return res.status(200).json({status: true, msg: result[0]});
    })
});

module.exports = route;