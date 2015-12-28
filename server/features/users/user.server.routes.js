var userCtrl = require('./user.server.controller');

module.exports = function (app) {
    
    app.route('/api/v1/user/:id')
        .post(userCtrl.updateLocation) // POST USER'S CURRENT LOCATION
        .get(userCtrl.getLocations) // GET LOCATIONS OF USER'S CONNECTIONS


};