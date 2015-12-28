var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    name: { type: String, required: true, unique: true },
    googleId: { type: String, required: true, unique: true },
    image: { type: String },
    currentLocation: {
        lattitude: { type: String },
        longitude: { type: String }
    },
    lastKnownLocation: {
        lattitude: { type: String },
        longitude: { type: String }
    },
    connections: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

module.exports = mongoose.model('User', UserSchema);