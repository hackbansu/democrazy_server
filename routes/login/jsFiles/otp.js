const express = require('express');
const route = express.Router();
const db = require('../../../database/JS/db');
const validateReqParams = require('../../../myJsModules/validation/reqParams');
const plivo = require('plivo');
const smsService = plivo.RestAPI({
    authId: process.env.PLIVO_authId,
    authToken: process.env.PLIVO_authToken,
});

//function to generate an OTP
function generateOtp() {
    let otp = parseInt(Math.random() * 999999);
    if (otp < 100000) {
        otp += 100000;
    }
    return otp;
}

//function to set otp timeout and return timeout id
//params = {identity: object(phone, otp)}
function setTimeoutForOtp(identity) {
    //setting timeout to discard otp
    let timeoutTime = 180000;
    let timeoutCb = function (err, result) {
        if (err) {
            console.log('error discarding otp for ', identity,
                "\nHaving error: ", err);
        }
    };
    let timeoutId = setTimeout(db.temp_users_table.deleteUsers, timeoutTime, identity, timeoutCb);
    return timeoutId;
}

//function send otp to user
//params = {identity: object(phone, otp), cb: function}
function sendOtp(identity, cb) {
    //sending otp
    let params = {
        'src': 'democrazy', // Sender's phone number with country code
        'dst': '+91' + identity['phone'], // Receiver's phone Number with country code
        'text': "Hi, your otp for democrazy is: " + identity['otp'] + " valid for 3 minutes only", // Your SMS Text Message - English
    };

    smsService.send_message(params, function (status, response) {
        if (status !== 202) {
            return cb(response);
        }
        return cb(null, response);
    });
}

//request handler to send otp on login
//req.body = {phone}
route.post('/sendNew', function (req, res) {
    let phone = parseInt(req.body.phone);

    //validation of params (phone)
    let validation = validateReqParams({integ: [{val: phone, minVal: 1000000000, maxVal: 9999999999}]});
    if (validation) {
        console.log(validation);
        return res.status(400).json({status: false, msg: "invalid params"});
    }

    //generating an OTP
    let otp = generateOtp();
    let newEntry = {
        phone: phone,
        otp: otp
    };

    //check for user availability in users table
    db.users_table.getUsersDetails({phone: phone}, ['id'], function (err, result) {
        if (err) {
            console.log(err);
            return res.status(503).json({status: false, msg: "error in database"});
        }
        if (result.length !== 0) {
            //old user
            newEntry['user_id'] = result[0].id;
        }
        // set timeout. Create or update user entry in temp_users and send otp
        let timeOut = setTimeoutForOtp(newEntry);
        db.temp_users_table.createOrUpdateUser(newEntry, function (err, result) {
            if (err) {
                clearTimeout(timeOut);
                console.log(err);
                return res.status(503).json({status: false, msg: "error in database"});
            }
            sendOtp(newEntry, function (err, result) {
                if (err) {
                    console.log(err);
                    return res.status(503).json({status: false, msg: "error sending otp"});
                }
                return res.status(200).json({status: true, msg: result['message']});
            })
        })
    });
});


module.exports = route;