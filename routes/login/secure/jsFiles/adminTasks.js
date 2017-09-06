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

    db.opinion_polls_table.addNewOpinionPolls(data,function (err, result) {
        if (err) {
            console.log(err);
            return res.status(503).json({status: false, msg: "error in database"});
        }
        return res.status(200).json({status: true, msg: result["message"]});
    })
})
;

module.exports = route;