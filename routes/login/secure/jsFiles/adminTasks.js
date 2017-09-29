const express = require('express');
const route = express.Router();
const db = require('../../../../database/JS/db');
const validateReqParams = require('../../../../myJsModules/validation/reqParams');


//function to add new poll questions (limited functionality: everyquestion will have same SCId and validity(1 month))
//req.body = {questions: array of questions, SCId(state_central_id)}
route.post('/addNewOpinionPolls', function (req, res) {
    let questions = req.body['questions'];
    let SCId = parseInt(req.body['SCId']);
    let dateStart = new Date();
    let dateEnd = new Date();
    dateEnd.setMonth(dateStart.getMonth() + 1);

    //validation of params (ques, SCId)
    let strs = questions.map(function (val) {
        return {val: val, minLen: 5, maxLen: Number.MAX_SAFE_INTEGER};
    });
    let validation = validateReqParams({
        integ: [{val: SCId, minVal: 1, maxVal: 100}],
        strs: strs
    });
    if (validation) {
        console.log(validation);
        return res.status(400).json({status: false, msg: "invalid params"});
    }

    let data = questions.map(function (val) {
        return {question: val, SCId, dateStart, dateEnd};
    });

    db.opinion_polls_table.addNewOpinionPolls(data, function (err, result) {
        if (err) {
            console.log(err);
            return res.status(503).json({status: false, msg: "error in database"});
        }
        return res.status(200).json({status: true, msg: result["message"]});
    })
});

//function to add new bill or ordinance
//req.body (JSON body) = {phone, identity: Object containing details of bill/ordinance
// (name, date("yyyy-mm-dd"), type, state_central_id, synopsis, pros, cons, newspaper_articles_links)
route.post('/addNewBillOrdinance', function (req, res) {
    let identity = req.body['identity'];
    identity['date'] = new Date(identity['date']);

    //validation of params (ques, SCId)
    let validation = validateReqParams({
        dates: [{val: identity.date, above18: false}],
        integ: [{val: identity['type'], minVal: 0, maxVal: 3},
            {val: identity['state_central_id'], minVal: 1, maxVal: 100}],
        strs: [{val: identity['name'], minLen: 1, maxLen: 150},
            {val: identity['synopsis'], minLen: 1, maxLen: Number.MAX_SAFE_INTEGER},
            {val: identity['pros'], minLen: 1, maxLen: Number.MAX_SAFE_INTEGER},
            {val: identity['cons'], minLen: 1, maxLen: Number.MAX_SAFE_INTEGER},
            {val: identity['newspaper_articles_links'], minLen: 1, maxLen: Number.MAX_SAFE_INTEGER}]
    });
    if (validation) {
        console.log(validation);
        return res.status(400).json({status: false, msg: "invalid params"});
    }

    db.bills_ordinances_table.getMaxId(function (err, result) {
        if (err) {
            console.log(err);
            return res.status(503).json({status: false, msg: "error in database"});
        }
        if (result.length === 0) {
            identity['actual_bill_link'] = '/login/unSecure/1.pdf';
        } else {
            identity['actual_bill_link'] = '/login/unSecure/' + (result[0]['mId'] + 1) + '.pdf';
        }
        db.bills_ordinances_table.insertNew(identity, function (err, result) {
            if (err) {
                console.log(err);
                return res.status(503).json({status: false, msg: "error in database"});
            }
            return res.status(200).json({status: true, msg: result["message"]});
        })
    });
});


//function to reset last opinion poll id and remove corresponding entries from votes table
//req.query = {newOPId}
route.get('/resetOPIdAndEntries', function (req, res) {
    let newOPId = req.query['newOPId'];
    let identity = {
        id: req['user']['id']
    };

    //validation of params (ques, SCId)
    let validation = validateReqParams({
        integ: [{val: newOPId, minVal: 0, maxVal: Number.MAX_SAFE_INTEGER}]
    });
    if (validation) {
        console.log(validation);
        return res.status(400).json({status: false, msg: "invalid params"});
    }

    //updating users table to set last_OP_id to newOPId
    db.users_table.updateUsersDetails(identity, {last_OP_id: newOPId}, function (err, result) {
        if (err) {
            console.log(err);
            return res.status(503).json({status: false, msg: "error in database"});
        }
        let identity2 = {
            user_id: req['user']['id']
        };
        db.opinion_polls_votes_table.deleteVotes(identity2, newOPId, function (err, result) {
            if (err) {
                console.log(err);
                return res.status(503).json({status: false, msg: "error in database"});
            }
            return res.status(200).json({status: true, msg: result["message"]});
        })
    });
});

module.exports = route;