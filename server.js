// REQUIRE EXPRESS, MONGOOSE & PASSPORT //
var express = require('./server/config/express');
var mongoose = require('./server/config/mongoose');
var passport = require('passport');
require('./server/config/passport.google')(passport);

// RUN EXPRESS & MONGOOSE CONFIG //
var app = express();
var db = mongoose();

// INITIALIZE PASSPORT //
app.use(passport.initialize());
app.use(passport.session());

// ROUTES //
require('./server/features/auth/auth.server.routes')(app, passport);
require('./server/features/users/user.server.routes')(app);

// PORT //
var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log('Listenting on port ' + port);
});