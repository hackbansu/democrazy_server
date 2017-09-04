const express = require('express');
const route = express.Router();
const db = require('../../../../database/JS/db');
const validateReqParams = require('../../../../myJsModules/validation/reqParams');

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

//function to logout a user
route.get('/logout', function (req, res) {
    req.logout();
    return res.status(200).json({status: true, msg: "logout success"});
})

module.exports = route;