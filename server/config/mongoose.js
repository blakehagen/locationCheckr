var mongoose = require('mongoose');

module.exports = function () {
    var mongoUri = 'mongodb://location-tracker:location-tracker@ds037165.mongolab.com:37165/location-tracker';
    mongoose.connect(mongoUri);
    mongoose.connection.once('open', function () {
        console.log('Connection to mongoDB successful')
    });
};