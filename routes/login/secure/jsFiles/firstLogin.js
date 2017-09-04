const express = require('express');
const route = express.Router();
const db = require('../../../../database/JS/db');
const validateReqParams = require('../../../../myJsModules/validation/reqParams');


//request handler to store other details of first time login user
//req.body = {fullName, dob:"yyyy-mm-dd", gender, email, pinCode}
route.post('/submitDetails', function (req, res) {
    if (req['user']['fullName']) {
        return res.status(404).json({status: false, msg: "First login submission already done"});
    }

    let updates = {
        fullName: req.body.fullName,
        dob: new Date(req.body.dob),
        gender: req.body.gender,
        email: req.body.email,
        pinCode: parseInt(req.body.pinCode),
    }
    let phone = parseInt(req['user'].phone);

    //validation of params (fullName, dob, gender, email, pinCode, phone)
    let validation = validateReqParams({
        strs: [{val: updates.fullName, minLen: 3, maxLen: 40}],
        dates: [{val: updates.dob, above18: true}],
        genders: [{val: updates.gender}],
        emails: [{val: updates.email, minLen: 5, maxLen: 150}],
        integ: [{val: updates.pinCode, minVal: 100000, maxVal: 999999}],
    });
    if (validation) {
        console.log(validation);
        return res.status(404).json({status: false, msg: "invalid params"});
    }

    db.users_table.updateUsersDetails({phone: phone}, updates, function (err, result) {
        if (err) {
            console.log(err);
            return res.status(404).json({status: false, msg: "error updating details"});
        }
        return res.status(200).json({status: true, msg: result['message']});
    })
});

module.exports = route;