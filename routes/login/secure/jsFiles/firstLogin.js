const express = require('express');
const route = express.Router();
const db = require('../../../../database/JS/db');
const validateReqParams = require('../../../../myJsModules/validation/reqParams');


//request handler to store other details of first time login user
//req.body = {fullName, dob:"yyyy-mm-dd", gender, email, pinCode}
route.post('/submitDetails', function (req, res) {
    if (req['user']['fullName']) {
        return res.status(403).json({status: false, msg: "First login submission already done"});
    }

    let updates = {
        fullName: req.body.fullName,
        dob: new Date(req.body.dob),
        gender: req.body.gender,
        email: req.body.email,
    }
    let pinCode = parseInt(req.body.pinCode);
    let phone = parseInt(req['user'].phone);

    //validation of params (fullName, dob, gender, email, pinCode, phone)
    let validation = validateReqParams({
        strs: [{val: updates.fullName, minLen: 3, maxLen: 40}],
        dates: [{val: updates.dob, above18: true}],
        genders: [{val: updates.gender}],
        emails: [{val: updates.email, minLen: 5, maxLen: 150}],
        integ: [{val: pinCode, minVal: 100000, maxVal: 999999}],
    });
    if (validation) {
        console.log(validation);
        return res.status(400).json({status: false, msg: "invalid params"});
    }

    //getting stateId and localityId based on pinCode received
    db.localities_table.getLocalities({pinCode: pinCode}, ['*'], function (err, result) {
        if (err) {
            console.log(err);
            return res.status(503).json({status: false, msg: "error in database"});
        }
        if (result.length === 0) {
            return res.status(400).json({status: false, msg: "invalid params"});
        }

        updates['locality_id_F_I'] = result[0]['id'];
        updates['state_id_O_Polls'] = result[0]['state_id'];

        //update data in users table
        db.users_table.updateUsersDetails({id: req['user']['id']}, updates, function (err, result) {
            if (err) {
                console.log(err);
                return res.status(503).json({status: false, msg: "error in database"});
            }
            //set an event to reset attempts left for state change for opinion polls
            db.users_table.timerToResetSCAL({phone: req['user']['phone']}, function (err, result) {
                if (err) {
                    console.log(err);
                    return res.status(503).json({status: false, msg: "error in database"});
                }
                //setting entries for user's states for bills and ordinances
                db.users_opted_states_for_bills_table.insertEntries(req['user']['id'],
                    [1, updates['state_id_O_Polls']], function (err, result) {
                    if (err) {
                        console.log(err);
                        return res.status(503).json({status: false, msg: "error in database"});
                    }
                    return res.status(200).json({status: true, msg: result['message']});
                });
            })
        })
    });
});

module.exports = route;