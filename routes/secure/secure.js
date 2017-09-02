const express = require('express');
const route = express.Router();
const cookieParser = require('cookie-parser');
const passport = require('passport'), passportLocal = require('passport-local');
const session = require('express-session');
const flash = require('connect-flash');
const LocalStrategy = passportLocal.Strategy;
const db = require('./../../database/JS/db');
const validateReqParams = require('../../myJsModules/validation/reqParams');
const routes = {
    otp: require('./jsFiles/otp'),
    firstLogin: require('./jsFiles/firstLogin'),
    user: require('./jsFiles/user'),
};


passport.use(new LocalStrategy({
    usernameField: 'phone',
    passwordField: 'otp'
}, function (phone, otp, cb) {
    otp = parseInt(otp);
    phone = parseInt(phone);
    let identity = {phone: phone, otp: otp};

    //validation of params (phone, otp)
    let validation;
    if (validation = validateReqParams({
            integ: [{val: phone, min: 1000000000, max: 9999999999},
                {val: otp, min: 100000, max: 999999}]
        })) {
        return cb(null, false, {message: "invalid params format"});
    }

    db.temp_users_table.getUsersDetails(identity, ['*'], function (err, result) {
        if (err) {
            return cb(err, false, {message: "database error"});
        }
        if (result.length === 0) {
            return cb(null, false, {message: 'invalid credentials'});
        }

        let tempUser = result[0];
        if (tempUser.user_id) {
            //old user
            //retrieve the user data and send in response
            db.users_table.getUsersDetails({phone: tempUser.phone}, ["*"], function (err, result) {
                if (err || result.length === 0) {
                    return cb(err, false, {message: "database error"});
                }
                if (result[0]['fullName']) {
                    return cb(null, {phone: result[0]['phone']}, {message: JSON.stringify(result[0])});
                } else {
                    return cb(null, {phone: result[0]['phone']}, {message: "request other details"});
                }
            })
        } else {
            //new user
            //creating new user in users table
            db.users_table.createUser({phone: tempUser.phone}, function (err, result) {
                if (err) {
                    return cb(err, false, {message: "database error"});
                }
                return cb(null, {phone: tempUser.phone}, {message: "request other details"});
            })
        }
    })
}));
passport.serializeUser(function (user, cb) {
    return done(null, {
        phone: user.phone,
    });
});
passport.deserializeUser(function (user, cb) {
    //get id, fullName of user from database
    db.users_table.getUsersDetails({phone: user['phone']}, ['id', 'phone', 'fullName'], function (err, result) {
        return cb(null, {
            id: result[0]['id'],
            phone: result[0]['phone'],
            fullName: result[0]['fullName']
        });
    });

})

route.use(cookieParser());
route.use(session({
    secret: 'democrazy-server',
    resave: false,
    saveUninitialized: false,
}));
route.use(flash());
route.use(passport.initialize());
route.use(passport.session());

//request to login
//req.body = {phone, otp}
route.post('/loginNow', passport.authenticate('local', {failureFlash: true, successFlash: true}));
route.post('/otp', routes.otp);

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

route.post('/firstLogin', routes.firstLogin);

function checkUserBasicDetails(req, res, next) {
    if (!req['user']['fullName']) {
        return res.status(404).json({status: false, msg: "please complete first login process"});
    } else {
        return next();
    }
}
route.use(checkUserBasicDetails);

// route.use('/user', routes.user);

module.exports = route;