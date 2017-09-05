const express = require('express');
const route = express.Router();
const db = require('../../../../database/JS/db');
const validateReqParams = require('../../../../myJsModules/validation/reqParams');

//function to serve count number of new opinion polls
//req.query = {count}
route.get('/getNew', function (req, res) {
    let count = parseInt(req.query.count);
    let dateAfterwards = new Date();
    let stateId = req['user']['state_id_O_Polls'];
    let last_OP_id = req['user']['last_OP_id'];
    if(!last_OP_id){
        last_OP_id = 0;
    }

    //validation of params (count)
    let validation = validateReqParams({
        integ: [{val: count, minVal: 1, maxVal: 100}],
    });
    if (validation) {
        console.log(validation);
        return res.status(400).json({status: false, msg: "invalid params"});
    }

    db.opinion_polls_table.getNewOpinionPolls(dateAfterwards, last_OP_id, stateId, ['*'], count, function (err, result) {
        if (err) {
            console.log(err);
            return res.status(503).json({status: false, msg: "error in database"});
        }
        return res.status(200).json({status: true, msg: result[0]});
    })
});

module.exports = route;