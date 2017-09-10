global.__basedir = __dirname;
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


const routes = {
    login: require('./routes/login/login'),
};

app.use(function (req, res, next) {
    console.log("ip: " + req.ip, " \ttime: " + new Date().toLocaleString(), " \turl: " + req.url);
    next();
});
app.use('/login', routes.login);
app.get('/', function (req, res) {
    res.send("server Working");
});
app.use('/', function (req, res) {
    res.send("invalid request");
});

app.listen(process.env.PORT, function () {
    console.log("server started at port number " + process.env.PORT);
});
