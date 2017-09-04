const express = require('express');
const route = express.Router();
const cookieParser = require('cookie-parser');
const passport = require('passport'), passportLocal = require('passport-local');
const session = require('express-session');
const LocalStrategy = passportLocal.Strategy;
const db = require('./../../database/JS/db');
const validateReqParams = require('../../myJsModules/validation/reqParams');
const routes = {
    otp: require('./jsFiles/otp'),
    secure: require('./secure/secure')
};

passport.use(new LocalStrategy({
    usernameField: 'phone',
    passwordField: 'otp'
}, function (phone, otp, cb) {
    otp = parseInt(otp);
    phone = parseInt(phone);
    let identity = {phone: phone, otp: otp};

    //validation of params (phone, otp)
    let validation = validateReqParams({
        integ: [{val: phone, minVal: 1000000000, maxVal: 9999999999},
            {val: otp, minVal: 100000, maxVal: 999999}]
    });
    if (validation) {
        console.log(validation);
        return cb(null, false, {message: "invalid credentials"});
    }

    db.temp_users_table.getUsersDetails(identity, ['*'], function (err, result) {
        if (err) {
            return cb(err, false, {message: "error in database"});
        }
        if (result.length === 0) {
            return cb(null, false, {message: 'invalid credentials'});
        }

        let tempUser = result[0];
        if (tempUser.user_id) {
            //old user
            //retrieve the user data and send in response
            db.users_table.getUsersDetails({id: tempUser.user_id}, ["*"], function (err, result) {
                if (err) {
                    return cb(err, false, {message: "error in database"});
                }
                if (result.length === 0) {
                    return cb("error", false, {message: "error in database"});
                }
                if (result[0]['fullName']) {
                    return cb(null, {id: result[0]['id']}, {message: result[0]});
                } else {
                    return cb(null, {id: result[0]['id']}, {message: "request other details"});
                }
            })
        } else {
            //new user
            //creating new user in users table
            db.users_table.createUser({phone: tempUser.phone}, function (err, result) {
                if (err) {
                    return cb(err, false, {message: "error in database"});
                }

                return cb(null, {id: result['insertId']}, {message: "request other details"});
            })
        }
    })
}));
passport.serializeUser(function (user, cb) {
    return cb(null, {
        id: user.id,
    });
});
passport.deserializeUser(function (user, cb) {
    //get all details of user from database
    db.users_table.getUsersDetails({id: user['id']}, ['*'], function (err, result) {
        if (err) {
            return cb(err, null);
        }
        if(result.length === 0){
            return cb("error", null);
        }
        return cb(null, result[0]);
    });
});

route.use(cookieParser(process.env.EXPRESS_SESSION_SECRET));
route.use(session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));
route.use(passport.initialize());
route.use(passport.session());

//handling requests of logged in user
route.use('/secure', routes.secure);


//handling login related requests
function checkUser(req, res, next) {
    if (req['user']) {
        return res.status(403).json({status: false, msg: "user already logged in"});
    }
    else {
        return next();
    }
}

route.use(checkUser);

//request to login
//req.body = {phone, otp}
route.post('/loginNow', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            console.log(err);
            return res.status(503).json({status: false, msg: info['message']});
        }
        if (!user) {
            return res.status(404).json({status: false, msg: info['message']});
        }
        req.logIn(user, function (err) {
            if (err) {
                console.log(err);
                return res.status(503).json({status: false, msg: "error in database"});
            }
            return res.status(200).json({status: true, msg: info['message']});
        });
    })(req, res, next);
});
route.use('/otp', routes.otp);

module.exports = route;