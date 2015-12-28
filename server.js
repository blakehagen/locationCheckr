// REQUIRE EXPRESS, MONGOOSE //
var express = require('./server/config/express');
var mongoose = require('./server/config/mongoose');

// RUN EXPRESS & MONGOOSE CONFIG //
var app = express();
var db = mongoose();











// PORT //
var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log('Listenting on port ' + port);
});