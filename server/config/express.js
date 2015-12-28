var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var session = require('express-session');

module.exports = function () {

    var app = express();

    app.use(cors());
    app.use(bodyParser.json());

    app.use(session({ secret: 'thisismysecret123!2!' }));

    app.use(express.static('./public'));

    return app;
};