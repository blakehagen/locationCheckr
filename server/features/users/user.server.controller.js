var User = require('./user.server.model');

module.exports = {

    getUserData: function (req, res, next) {
        User.findById(req.params.id).populate('connections').exec(function (err, user) {
            for (var i = 0; i < user.connections.length; i++) {
                if (user.connections[i].currentLocation[0] === null) {
                    user.connections[i].currentLocation = [];
                }
            }
            if (err) {
                res.status(500).send(err);
            }
            // console.log(user);
            user.googleId = null; // DONT NEED GOOGLE ID ON CLIENT SIDE
            res.status(200).json(user);
        })
    },

    updateLocation: function (req, res, next) {
        User.findByIdAndUpdate(req.params.id, req.body, { new: true }, function (err, user) {
            if (err) {
                res.status(500).send(err);
            }
            res.status(200).json(user);
        })
    },

    stopLocation: function (req, res, next) {
        User.findByIdAndUpdate(req.params.id, req.body, { new: true }, function (err, user) {
            if (err) {
                res.status(500).send(err);
            }
            res.status(200).json(user);
        })
    },

    getConnectionLocations: function (req, res, next) {
        User.findById(req.params.id).lean().populate('connections').exec(function (err, result) {
            if (result) {
                delete result.googleId;
                delete result.image;
                delete result.created_at;
                for (var i = 0; i < result.connections.length; i++) {
                    delete result.connections[i].googleId;
                    delete result.connections[i].connections;
                    delete result.connections[i].created_at;

                    if (result.connections[i].currentLocation[0] === null) {
                        result.connections[i].currentLocation = [];
                    }
                    // if (result.connections[i].lastKnownLocation[0] === null) {
                    //     delete result.connections[i].lastKnownLocation;
                    // }
                }
            }
            if (err) {
                res.status(500).send(err);
            }
            res.status(200).json(result);
        })
    }



};