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
    if (!last_OP_id) {
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
        return res.status(200).json({status: true, msg: result});
    })
});

//function to submit opinion polls
//req.body = {phone, votes: obj}
route.post('/submitPoll', function (req, res) {
    let votes = JSON.parse(req.body.votes);
    let userId = req['user']['id'];
    let new_last_OP_id = 0;

    //validation of params (votes) and update new_last_OP_id
    let integ = Object.keys(votes).map(function (val, index, arr) {
        if (new_last_OP_id < parseInt(val)) {
            new_last_OP_id = parseInt(val);
        }
        return {val: parseInt(val), minVal: 1, maxVal: Number.MAX_SAFE_INTEGER};
    });
    let moreIntegs = Object.keys(votes).map(function (val, index, arr) {
        val = votes[val];
        return {val: parseInt(val), minVal: 0, maxVal: 2};
    });
    integ = integ.concat(moreIntegs);
    let validation = validateReqParams({integ: integ});
    if (validation) {
        console.log(validation);
        return res.status(400).json({status: false, msg: "invalid params"});
    }

    //generating data to insert into the table
    let tableData = Object.keys(votes).map(function (val, index, arr) {
        return {
            opinion_poll_id: parseInt(val),
            vote: parseInt(votes[val]),
        };
    });

    db.opinion_polls_votes_table.addVotes(userId, tableData, function (err, result) {
        if (err) {
            console.log(err);
            return res.status(503).json({status: false, msg: "error in database"});
        }
        db.users_table.updateUsersDetails({id: userId}, {last_OP_id: new_last_OP_id}, function (err, result) {
            if (err) {
                console.log(err);
                return res.status(503).json({status: false, msg: "error in database"});
            }
            return res.status(200).json({status: true, msg: result});
        })
    })
});


module.exports = route;