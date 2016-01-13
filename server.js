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

// SOCKET.IO INITIALIZE //
var http = require('http').Server(app);
var io = require('socket.io')(http);

// ROUTES //
require('./server/features/auth/auth.server.routes')(app, passport);
require('./server/features/users/user.server.routes')(app);

// SOCKET.IO //
io.on('connection', function (socket) {
    console.log('User connected to socket', socket.id);
    socket.on('userUpdated', function (userToUpdateId) {
        console.log('id of user that needs to be updated by others ', userToUpdateId);
        socket.broadcast.emit('updateThisUser', userToUpdateId);
    });
});

// PORT //
var port = process.env.PORT || 3000;
http.listen(port, function () {
    console.log('locationCheckr listenting on port ' + port);
});