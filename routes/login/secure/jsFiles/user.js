const express = require('express');
const route = express.Router();
const db = require('../../../../database/JS/db');
const validateReqParams = require('../../../../myJsModules/validation/reqParams');

//function to send user details with array of states opted for bills and ordinances
//req.query = {}
route.get('/getDetails', function (req, res) {
    let id = req['user']['id'];

    //getting basic user details
    db.users_table.getUsersDetails({id: id}, ['*'], function (err, result) {
        if (err) {
            console.log(err);
            return res.status(503).json({status: false, msg: "error in database"});
        }
        if (result.length === 0) {
            return res.status(503).json({status: false, msg: "error in database"});
        }
        let retVal = result[0];
        //getting states user opted for bills and ordinances
        db.users_opted_states_for_bills_table.getEntries({user_id: retVal['id']}, ['state_central_id'], function (err, result) {
            if (err) {
                console.log(err);
                return res.status(503).json({status: false, msg: "error in database"});
            }
            if (result.length === 0) {
                return res.status(503).json({status: false, msg: "error in database"});
            }
            retVal['BOStates'] = result.map(function (obj) {
                return obj['state_central_id'];
            });
            return res.status(200).json({status: true, msg: retVal});
        });
    })
});

//function to logout a user
//req.query = {}
route.get('/logout', function (req, res) {
    req.logout();
    return res.status(200).json({status: true, msg: "logout success"});
});

module.exports = route;