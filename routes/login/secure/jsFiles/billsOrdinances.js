const express = require('express');
const route = express.Router();
const db = require('../../../../database/JS/db');
const validateReqParams = require('../../../../myJsModules/validation/reqParams');



//function to update the states(including central) user opted for bills and ordinances
//req.query = {phone ,SCIds: array of integers}
route.post('/updateStates', function (req, res) {
    let SCIds = JSON.parse(req.body['SCIds']);

    //validation of params (SCIds)
    let integ = SCIds.map(function (val) {
        return {val: val, minVal: 1, maxVal: 100};
    })
    let validation = validateReqParams({
        integ: integ,
    });
    if (validation) {
        console.log(validation);
        return res.status(400).json({status: false, msg: "invalid params"});
    }

    //removing previous entries
    db.users_opted_states_for_bills_table.deleteEntries({user_id: req['user']['id']}, function (err, result) {
        if (err) {
            console.log(err);
            return res.status(503).json({status: false, msg: "error in database"});
        }
        //inserting new entries into the table
        db.users_opted_states_for_bills_table.insertEntries(req['user']['id'], SCIds, function (err, result) {
            if (err) {
                console.log(err);
                return res.status(503).json({status: false, msg: "error in database"});
            }
            return res.status(200).json({status: true, msg: result['message']});
        });
    });
});

module.exports = route;