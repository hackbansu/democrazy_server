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
    let validation;
    let integ = state_central_ids.map(function (val, index, arr) {
        return {val: val, min: 0, max: Number.MAX_SAFE_INTEGER};
    });
    integ.push({val: type, min: 0, max: 3});
    integ.push({val: offset, min: 0, max: Number.MAX_SAFE_INTEGER});
    integ.push({val: count, min: 1, max: 100});
    if (validation = validateReqParams({integ: integ})) {
        return res.status(404).json({status: false, msg: "invalid params"});
    }

    db.bills_ordinances_table.getBillsAndOrdinances(type, state_central_ids, offset, count, function (err, result) {
        if (err) {
            return res.status(404).json({status: false, msg: "error in database"});
        }
        return res.status(200).json({status: true, msg: "success", result: result});
    })
})

//request to get details of a bill or an ordinance via id
//req.query = {id}
route.get('/billOrdinanceDetails', function (req, res) {
    let id = parseInt(req.query.id);

    //validation of params (id)
    let validation;
    if (validation = validateReqParams({integ: {val: id, min: 1, max: Number.MAX_SAFE_INTEGER}})) {
        return res.status(404).json({status: false, msg: "invalid bill id"});
    }

    db.bills_ordinances_table.getBillOrdinanceDetails(id, function (err, result) {
        if (err) {
            return res.status(404).json({status: false, msg: "error in database"});
        }
        return res.status(200).json({status: true, msg: "success", result: result});
    })
})

module.exports = route;