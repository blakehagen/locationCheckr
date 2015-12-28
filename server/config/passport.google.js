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

        User.findOne({ 'google.googleId': profile.id }, function (err, user) {
            if (user) {
                profile._json.image.url = profile._json.image.url.replace('?sz=50', '');
                console.log('Google user found in db');
                if (user.google.image !== profile._json.image.url) {
                    user.google.image = profile._json.image.url;
                }
                user.save();
                done(null, user);
            } else {
                console.log('Google user not found in db');

                user = new User()
                user.google.googleId = profile.id;
                user.google.token = accessToken;
                user.google.name = profile.displayName;
                user.google.image = profile._json.image.url;
                user.google.email = profile.emails[0].value;
                // edit img url to not be just 50px //
                user.google.image = user.google.image.replace('?sz=50', '');
                console.log('New user created: ', user);

                user.save();
                done(null, user);
            }
        });
    }));
};