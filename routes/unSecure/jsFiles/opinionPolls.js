const db = require('../../../database/JS/db');
const express = require('express');
const route = express.Router();

route.post('/addNe', function (req, res) {
    let questions = req.body.ques;
    let date_start = new Date();
    let date_end = new Date()
    date_end.setMonth(date_start.getMonth() + 1);
    let data = {
        state_central_id: parseInt(req.body.scId),
        date_start: date_start,
        date_end: date_end,
    }
    db.opinion_polls_table.addNew(questions, data, function (err, re) {
        console.log(err, re);
    })
})

module.exports = route;