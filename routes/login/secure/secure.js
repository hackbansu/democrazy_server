const express = require('express');
const route = express.Router();
const db = require('./../../../database/JS/db');
const validateReqParams = require('../../../myJsModules/validation/reqParams');
const routes = {
    firstLogin: require('./jsFiles/firstLogin'),
    user: require('./jsFiles/user'),
};

function checkUser(req, res, next) {
    if (req['user']) {
        console.log("User authenticated at " + route.baseUrl);
        return next();
    }
    else {
        console.log("User NOT authenticated at " + route.baseUrl);
        return res.status(404).json({status: false, msg: "user not logged in"});
    }
}

route.use(checkUser);

route.use('/firstLogin', routes.firstLogin);

function checkUserBasicDetails(req, res, next) {
    if (req['user']['fullName']) {
        return next();
    } else {
        return res.status(404).json({status: false, msg: "please complete first login process"});
    }
}

route.use(checkUserBasicDetails);

route.use('/user', routes.user);

module.exports = route;