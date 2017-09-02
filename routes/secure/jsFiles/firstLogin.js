const express = require('express');
const route = express.Router();
const db = require('./../../../database/JS/db');
const validateReqParams = require('../../../myJsModules/validation/reqParams');


//request handler to store other details of new user
//req.body = {fullName, dob, gender, email, pinCode, phone, otp}
route.post('/submitDetails', function (req, res) {
    let updates = {
        fullName: req.body.fullName,
        dob: req.body.dob,
        gender: req.body.gender,
        email: req.body.email,
        pinCode: parseInt(req.body.pinCode),
    }
    let phone = parseInt(req.body.phone);
    let otp = parseInt(req.body.otp);


    //validation of params (fullName, dob, gender, email, pinCode, phone, otp)

    db.users_table.getUsersDetails({phone: phone}, ['*'], function (err, result) {
        if (err) {
            return res.status(404).json({status: false, msg: "error in database"});
        }
        if (result.length !== 0) {
            return res.status(404).json({status: false, msg: "Invalid credentials"});
        }

        let user = result[0];
        if (user['fullName']) {
            return res.status(404).json({status: false, msg: "First login submission already done"});
        }
        db.users_table.updateUsersDetails({phone: user['phone']}, updates, function (err, result) {
            if (err) {
                return res.status(404).json({status: false, msg: "error updating details"});
            }
            return res.status(200).json({status: true, msg: "success", result: ""});
        })
    })
});

module.exports = route;