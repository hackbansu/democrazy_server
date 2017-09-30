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

//function send otp to user
//params = {identity: object(phone, otp), cb: function}
function sendOtp(identity, cb) {
    //sending otp
    let params = {
        'src': process.env.PLIVO_SRC, // Sender's phone number with country code
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

    if(req.body.phone === "1234567899"){
        return res.status(200).json({status: true, msg: 'message(s) queued'});
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

        //Create or update user entry in temp_users
        db.temp_users_table.createOrUpdateUser(newEntry, function (err, result) {
            if (err) {
                console.log(err);
                return res.status(503).json({status: false, msg: "error in database"});
            }
            // set timeout
            db.temp_users_table.setNewOtpTimeout(newEntry, function (err, result) {
                if (err) {
                    console.log(err);
                    return res.status(503).json({status: false, msg: "error in database"});
                }
                //send otp
                sendOtp(newEntry, function (err, result) {
                    if (err) {
                        console.log(err);
                        return res.status(503).json({status: false, msg: "error sending otp"});
                    }
                    return res.status(200).json({status: true, msg: result['message']});
                })
            });
        })
    });
});


module.exports = route;