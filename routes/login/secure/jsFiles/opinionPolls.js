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
    let OPIds = Object.keys(votes);

    //validation of params (votes) and update new_last_OP_id
    let integ = OPIds.map(function (val, index, arr) {
        if (new_last_OP_id < parseInt(val)) {
            new_last_OP_id = parseInt(val);
        }
        return {val: parseInt(val), minVal: 1, maxVal: Number.MAX_SAFE_INTEGER};
    });
    let moreIntegs = OPIds.map(function (val, index, arr) {
        val = votes[val];
        return {val: parseInt(val), minVal: 0, maxVal: 2};
    });
    integ = integ.concat(moreIntegs);
    let validation = validateReqParams({integ: integ});
    if (validation) {
        console.log(validation);
        return res.status(400).json({status: false, msg: "invalid params"});
    }

    //checking that the votes are sent for the OP of user's opted state
    db.opinion_polls_table.getStateIdsForOPIds(OPIds, function (err, result) {
        if (err) {
            console.log(err);
            return res.status(503).json({status: false, msg: "error in database"});
        }
        if (result.length > 2 || result.length === 0) {
            return res.status(400).json({status: false, msg: "invalid params"});
        } else {
            let temp = result[0]['state_central_id'];
            if (result.length === 1) {
                if (temp !== req['user']['state_id_O_Polls'] && temp !== 1) {
                    return res.status(400).json({status: false, msg: "invalid params"});
                }
            } else {
                if (temp !== 1 || result[1]['state_central_id'] !== req['user']['state_id_O_Polls']) {
                    return res.status(400).json({status: false, msg: "invalid params"});
                }
            }
        }

        //generating data to insert into the table
        let tableData = OPIds.map(function (val, index, arr) {
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
                return res.status(200).json({status: true, msg: result['message']});
            })
        })
    });
});

//function to change state for opinion polls
//req.query = {stateId}
route.get('/changeState', function (req, res) {
    let attemptsLeft = req['user']['attempts_left_state_change_OP'];
    //deny if attempts left to change state are zero
    if (attemptsLeft === 0) {
        return res.status(400).json({status: false, msg: "no more attempts left"});
    }
    //decrementing attemptsLeft
    attemptsLeft--;
    let newStateId = parseInt(req.query.stateId);


    //validation of params (stateId)
    let validation = validateReqParams({
        integ: [{val: newStateId, minVal: 1, maxVal: 100}],
    });
    if (validation) {
        console.log(validation);
        return res.status(400).json({status: false, msg: "invalid params"});
    }

    //getting the id of last OP submitted for new state
    db.opinion_polls_votes_table.getLastOPIdOfState(req['user']['id'], newStateId, function (err, result) {
        if (err) {
            console.log(err);
            return res.status(503).json({status: false, msg: "error in database"});
        }
        //updating users table to set new stateId, last_OP_id, attemptsLeft
        db.users_table.updateUsersDetails({id: req['user']['id']}, {
            state_id_O_Polls: newStateId,
            last_OP_id: (result.length === 0 ? undefined : result[0].val),
            attempts_left_state_change_OP: attemptsLeft
        }, function (err, result) {
            if (err) {
                console.log(err);
                return res.status(503).json({status: false, msg: "error in database"});
            }
            return res.status(200).json({status: true, msg: result['message']});
        });
    });
});

module.exports = route;