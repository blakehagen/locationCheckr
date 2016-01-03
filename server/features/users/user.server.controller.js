var User = require('./user.server.model');

module.exports = {

    getUserData: function (req, res, next) {
        User.findById(req.params.id).populate('connections').populate('invitations').exec(function (err, user) {

            if (err) {
                res.status(500).send(err);
            }

            user.googleId = undefined; // DONT NEED GOOGLE ID ON CLIENT SIDE
            res.status(200).json(user);
        })
    },

    updateLocation: function (req, res, next) {
        User.findByIdAndUpdate(req.params.id, req.body, { new: true }, function (err, user) {
            if (err) {
                res.status(500).send(err);
            }

            user.googleId = undefined; // DONT NEED GOOGLE ID ON CLIENT SIDE
            res.status(200).json(user);
        })
    },

    stopLocation: function (req, res, next) {
        User.findByIdAndUpdate(req.params.id, req.body, { new: true }, function (err, user) {
            if (err) {
                res.status(500).send(err);
            }
            user.googleId = undefined; // DONT NEED GOOGLE ID ON CLIENT SIDE
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

                }
            }
            if (err) {
                res.status(500).send(err);
            }
            res.status(200).json(result);
        })
    },

    inviteToConnect: function (req, res, next) {
        console.log(req.body);
        User.findByIdAndUpdate(req.params.id, { $push: { invitations: req.body.id } }, { new: true }).populate('invitations').exec(function (err, result) {
            if (err) {
                res.status(500).json(err);
            }
            res.status(200).json(result);
        });
    },



};