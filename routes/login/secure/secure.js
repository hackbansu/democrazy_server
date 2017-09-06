const express = require('express');
const route = express.Router();
const db = require('./../../../database/JS/db');
const validateReqParams = require('../../../myJsModules/validation/reqParams');
const routes = {
    adminTasks: require('./jsFiles/adminTasks'),
    firstLogin: require('./jsFiles/firstLogin'),
    user: require('./jsFiles/user'),
    opinionPolls: require('./jsFiles/opinionPolls'),
};

//function to check if user is logged in or not
//every post request should contain phone in body
function checkUser(req, res, next) {
    if (req['user']) {
        if (Object.keys(req.body).length === 0) {
            console.log("User authenticated for get request at " + route.baseUrl);
            return next();
        }
        let phone = parseInt(req.body.phone);
        if (phone === req['user']['phone']) {
            console.log("User authenticated for post request at " + route.baseUrl);
            return next();
        }
    }
    console.log("User NOT authenticated at " + route.baseUrl);
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

function checkAdmin(req, res, next) {
    if (req['user']['phone'] === parseInt(process.env.ADMIN)) {
        return next();
    } else {
        return res.status(403).json({status: false, msg: "user not logged in"});
    }
}

route.use(checkAdmin);

route.use('/adminTasks', routes.adminTasks);

module.exports = route;