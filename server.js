const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


const routes = {
    secure: require('./routes/secure/secure'),
    unSecure: require('./routes/unSecure/unSecure')
};

app.use('/secure', routes.secure);
app.use('/unSecure', routes.unSecure);
app.get('/', function (req, res) {
    res.send("server Working");
})

app.listen(process.env.PORT, function () {
    console.log("server started at port number " + process.env.PORT);
});
