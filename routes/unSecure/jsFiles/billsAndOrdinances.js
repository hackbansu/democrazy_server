const express = require('express');
const route = express.Router();
const db = require('../../../database/JS/db');
const validateReqParams = require('../../../myJsModules/validation/reqParams');

//request to get count number of latest bills/ordinances of given states after an offset
//req.query = {type (0: pending bills, 1: passed bills, 2: enacted ordinances, 3: lapsed ordinances),
//              state_central_ids: array, offset, count}
route.get('/billsOrdinances', function (req, res) {
    let type = parseInt(req.query.type);
    let state_central_ids = JSON.parse(req.query.state_central_ids);
    let offset = parseInt(req.query.offset);
    let count = parseInt(req.query.count);

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
})

//request to get details of a bill or an ordinance via id
//req.query = {id}
route.get('/billOrdinanceDetails', function (req, res) {
    let id = parseInt(req.query.id);

    //validation of params (id)
    let validation = validateReqParams({integ: [{val: id, minVal: 1, maxVal: Number.MAX_SAFE_INTEGER}]});
    if (validation) {
        console.log(validation);
        return res.status(400).json({status: false, msg: "invalid params"});
    }

    db.bills_ordinances_table.getBillOrdinanceDetails(id, function (err, result) {
        if (err) {
            console.log(err);
            return res.status(503).json({status: false, msg: "error in database"});
        }
        return res.status(200).json({status: true, msg: result});
    })
})

module.exports = route;