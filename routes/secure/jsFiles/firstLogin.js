const express = require('express');
const route = express.Router();
const db = require('./../../../database/JS/db');
const validateReqParams = require('../../../myJsModules/validation/reqParams');


//request handler to store other details of first time login user
//req.body = {fullName, dob:"yyyy-mm-dd", gender, email, pinCode, phone}
route.post('/submitDetails', function (req, res) {
    let updates = {
        fullName: req.body.fullName,
        dob: new Date(req.body.dob),
        gender: req.body.gender,
        email: req.body.email,
        pinCode: parseInt(req.body.pinCode),
    }
    let phone = parseInt(req.body.phone);

    //validation of params (fullName, dob, gender, email, pinCode, phone)
    let validation = validateReqParams({
        strs: [{val: updates.fullName, minLen: 3, maxLen: 40}],
        dates: [{val: updates.dob, above18: true}],
        genders: [{val: updates.gender}],
        emails: [{val: updates.email, minLen: 5, maxLen: 150}],
        integ: [{val: updates.pinCode, minVal: 100000, maxVal: 999999}, {
            val: phone,
            minVal: 1000000000,
            maxVal: 9999999999
        }],
    });
    if (validation) {
        console.log(validation);
        return res.status(404).json({status: false, msg: "invalid params"});
    }


    db.users_table.getUsersDetails({phone: phone}, ['*'], function (err, result) {
        if (err) {
            console.log(err);
            return res.status(404).json({status: false, msg: "error in database"});
        }
        if (result.length === 0) {
            return res.status(404).json({status: false, msg: "Invalid credentials"});
        }

        let user = result[0];
        if (user['fullName']) {
            return res.status(404).json({status: false, msg: "First login submission already done"});
        }
        db.users_table.updateUsersDetails({phone: user['phone']}, updates, function (err, result) {
            if (err) {
                console.log(err);
                return res.status(404).json({status: false, msg: "error updating details"});
            }
            return res.status(200).json({status: true, msg: result['message']});
        })
    })
});

module.exports = route;