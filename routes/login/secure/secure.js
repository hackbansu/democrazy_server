const express = require('express');
const route = express.Router();
const db = require('./../../../database/JS/db');
const validateReqParams = require('../../../myJsModules/validation/reqParams');
const routes = {
    adminTasks: require('./jsFiles/adminTasks'),
    firstLogin: require('./jsFiles/firstLogin'),
    user: require('./jsFiles/user'),
    opinionPolls: require('./jsFiles/opinionPolls'),
    billsOrdinances: require('./jsFiles/billsOrdinances'),
};

//function to check if user is logged in or not
//every post request should contain phone in body
function checkUser(req, res, next) {
    if (req['user']) {
        if (Object.keys(req.body).length === 0) {
            console.log("User authenticated for get request at " + route.url);
            return next();
        }
        let phone = parseInt(req.body.phone);
        if (phone === req['user']['phone']) {
            console.log("User authenticated for post request at " + route.url);
            return next();
        }
    }
    console.log("User NOT authenticated at " + route.url);
    return res.status(401).json({status: false, msg: "user not logged in"});
}

route.use(checkUser);

route.use('/firstLogin', routes.firstLogin);

function checkUserBasicDetails(req, res, next) {
    if (req['user']['fullName']) {
        return next();
    } else {
        return res.status(403).json({status: false, msg: "please complete first login process"});
    }
}

route.use(checkUserBasicDetails);

route.use('/user', routes.user);
route.use('/opinionPolls', routes.opinionPolls);
route.use('/billsOrdinances', routes.billsOrdinances);

function checkAdmin(req, res, next) {
    let admPh = req['user']['phone'];   //admin phone number
    let penv = process.env;
    if (admPh === parseInt(penv.ADMIN1) || admPh === parseInt(penv.ADMIN2) || admPh === parseInt(penv.ADMIN3)) {
        return next();
    } else {
        return res.status(403).json({status: false, msg: "user not logged in"});
    }
}

route.use(checkAdmin);

route.use('/adminTasks', routes.adminTasks);

module.exports = route;