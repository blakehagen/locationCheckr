var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require('../features/users/user.server.model');
var googleAuth = require('./keys/googleAuthKeys');

module.exports = function (passport) {
    
    // SERIALIZE USER //
    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (user, done) {
        done(null, user);
    });

    // GOOGLE PASSPORT STRATEGY //
    passport.use(new GoogleStrategy({
        clientID: googleAuth.googleAuthKeys.clientID,
        clientSecret: googleAuth.googleAuthKeys.clientSecret,
        callbackURL: googleAuth.googleAuthKeys.callbackURL
    }, function (req, accessToken, refreshToken, profile, done) {

        User.findOne({ 'googleId': profile.id }, function (err, user) {
            if (user) {
                profile._json.image.url = profile._json.image.url.replace('?sz=50', '');
                console.log('Google user found in db');
                if (user.image !== profile._json.image.url) {
                    user.image = profile._json.image.url;
                }
                user.save();
                done(null, user);
            } else {
                console.log('Google user not found in db');
                user = new User()
                user.googleId = profile.id;
                user.name = profile.displayName;
                user.image = profile._json.image.url;
                // edit img url to not be just 50px //
                user.image = user.image.replace('?sz=50', '');
                // console.log('New user created: ', user);
                user.save();
                done(null, user);
            }
        });
    }));
};