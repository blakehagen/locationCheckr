// REQUIRE EXPRESS, MONGOOSE & PASSPORT //
var express = require('./server/config/express');
var mongoose = require('./server/config/mongoose');
var passport = require('passport');
require('./server/config/passport.google')(passport);

// RUN EXPRESS & MONGOOSE CONFIG //
var app = express();
var db = mongoose();

// ROUTES //
require('./server/features/users/user.server.routes')(app);












// PORT //
var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log('Listenting on port ' + port);
});