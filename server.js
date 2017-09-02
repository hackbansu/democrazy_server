const express = require('express');
const app = express();
const PORT = 4000;
const bodyParser = require('body-parser');

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

app.listen(PORT, function () {
    console.log("server started at port number " + PORT);
});
