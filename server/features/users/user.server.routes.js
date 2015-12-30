var userCtrl = require('./user.server.controller');

module.exports = function (app) {

    app.route('/api/v1/user/:id')
        .post(userCtrl.updateLocation) // POST USER'S CURRENT LOCATION
        .get(userCtrl.getUserData) // GET USER'S DATA
        
    app.route('/api/v1/user/stop/:id')
        .post(userCtrl.stopLocation) // POST USER'S CURRENT LOCATION
        
    app.route('/api/v1/user/:id/connections') // GET ONLY CONNECTION LOCATION DATA
        .get(userCtrl.getConnectionLocations)


};