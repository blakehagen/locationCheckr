var userCtrl = require('./user.server.controller');

module.exports = function (app) {

    app.route('/api/v1/user/:id')
        .post(userCtrl.updateLocation) // POST USER'S CURRENT LOCATION
        .get(userCtrl.getUserData) // GET USER'S DATA
        
    app.route('/api/v1/user/stop/:id')
        .post(userCtrl.stopLocation) // POST USER'S CURRENT LOCATION
        
    app.route('/api/v1/user/:id/connections') // GET ONLY CONNECTION LOCATION DATA
        .get(userCtrl.getConnectionLocations)

    app.route('/api/v1/user/invite/:id') // POST CONNECTION INVITE
        .post(userCtrl.inviteToConnect)

    app.route('/api/v1/user/accept/:id') // ACCEPT CONNECTION INVITE
        .post(userCtrl.acceptConnection)

    app.route('/api/v1/users') // GET ALL USERS IN DB
        .get(userCtrl.getAllUsers)


};