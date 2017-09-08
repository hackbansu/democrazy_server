const express = require('express');
const route = express.Router();
const path = require('path');
const db = require('./../../../database/JS/db');
const validateReqParams = require('./../../../myJsModules/validation/reqParams');
const routes = {
    billsOrdinances: require('./jsFiles/billsOrdinances'),
    financialInclusions: require('./jsFiles/financialInclusions'),
    opinionPolls: require('./jsFiles/opinionPolls'),
    user: require('./jsFiles/user'),
    locations: require('./jsFiles/locations')
};

route.use('/', express.static(path.join(__basedir, "/database/files/billsAndOrdinances/")));

route.use('/billsOrdinances', routes.billsOrdinances);
route.use('/financialInclusions', routes.financialInclusions);
route.use('/opinionPolls', routes.opinionPolls);
route.use('/user', routes.user);
route.use('/locations', routes.locations);

module.exports = route;