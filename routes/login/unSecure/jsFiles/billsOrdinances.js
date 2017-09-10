const express = require('express');
const route = express.Router();
const db = require('../../../../database/JS/db');
const validateReqParams = require('../../../../myJsModules/validation/reqParams');

//request to get count number of latest bills/ordinances of given states after an offset
//req.body = {type (0: pending bills, 1: passed bills, 2: enacted ordinances, 3: lapsed ordinances),
//              SCId: array, offset, count}
route.post('/get', function (req, res) {
    let type = parseInt(req.body.type);
    let state_central_ids = JSON.parse(req.body.SCId);
    let offset = parseInt(req.body.offset);
    let count = parseInt(req.body.count);

    //validation of params (type, state_central_ids, offset, count)
    let integ = state_central_ids.map(function (val, index, arr) {
        return {val: val, minVal: 0, maxVal: Number.MAX_SAFE_INTEGER};
    });
    integ.push({val: type, minVal: 0, maxVal: 3});
    integ.push({val: offset, minVal: 0, maxVal: Number.MAX_SAFE_INTEGER});
    integ.push({val: count, minVal: 1, maxVal: 100});
    let validation = validateReqParams({integ: integ});
    if (validation) {
        console.log(validation);
        return res.status(400).json({status: false, msg: "invalid params"});
    }

    db.bills_ordinances_table.getBillsAndOrdinances(type, state_central_ids, offset, count, function (err, result) {
        if (err) {
            console.log(err);
            return res.status(503).json({status: false, msg: "error in database"});
        }
        return res.status(200).json({status: true, msg: result});
    })
});

//request to get details of a bill or an ordinance via its id
//req.query = {BOId}
route.get('/detail', function (req, res) {
    let BOId = parseInt(req.query['BOId']);

    //validation of params (BOId)
    let validation = validateReqParams({integ: [{val: BOId, minVal: 1, maxVal: Number.MAX_SAFE_INTEGER}]});
    if (validation) {
        console.log(validation);
        return res.status(400).json({status: false, msg: "invalid params"});
    }

    db.bills_ordinances_table.getBillOrdinanceDetails(BOId, function (err, result) {
        if (err) {
            console.log(err);
            return res.status(503).json({status: false, msg: "error in database"});
        }
        if (result.length === 0) {
            return res.status(400).json({status: false, msg: "invalid params"});
        }

        let retVal = result[0];
        retVal['pollStatus'] = undefined;
        //checking if user is logged in
        if (req['user']) {
            //getting if a vote is submitted by user for this bill or ordinance
            db.bills_ordinances_votes_table.getVotes({
                user_id: req['user']['id'],
                bill_ordinance_id: result[0]['id'],
            }, ['vote'], function (err, result) {
                if (err) {
                    console.log(err);
                    return res.status(503).json({status: false, msg: "error in database"});
                }
                if (result.length === 0) {
                    //user haven't yet voted for this bill or ordinance
                    return res.status(200).json({status: true, msg: retVal});
                }
                //user have voted before, setting the vote in retVal
                retVal['pollStatus'] = result[0].vote;
                return res.status(200).json({status: true, msg: retVal});
            })
        } else {
            //user not logged in, hence he haven't voted for the bill or ordinance
            return res.status(200).json({status: true, msg: retVal});
        }
    });
});

module.exports = route;