const db = require('../../../database/JS/db');
const express = require('express');
const route = express.Router();

//request to get all states names
//req.query = {}
route.get('/getAllStates', function (req, res) {
    db.states_table.getAllStates(function (err, result) {
        if(err){
            return res.status(404).json({status: false, msg: "error in database"});
        }
        return res.status(200).json({status: true, msg: "success", result: result});
    })
})

module.exports = route;