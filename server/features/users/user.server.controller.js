var User = require('./user.server.model');

module.exports = {

    getUserData: function (req, res, next) {
        User.findById(req.params.id).populate('connections').exec(function (err, user) {
            if (err) {
                res.status(500).send(err);
            }
            // console.log(user);
            user.googleId = null; // DONT NEED GOOGLE ID ON CLIENT SIDE
            res.status(200).json(user);
        })
    },

    updateLocation: function () {

    },


};