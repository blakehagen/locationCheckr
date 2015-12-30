var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    name: { type: String, required: true, unique: true },
    googleId: { type: String, required: true, unique: true },
    image: { type: String },
    currentLocation: { type: [Number] }, // --> **** NOTE **** MONGOOSE REQUIRES [LONG, LAT] FORMAT // GOOGLE MAPS REQUIRES OPPOSITE [LAT, LONG] //
    lastKnownLocation: { type: [Number] },
    htmlverified: { type: String },
    created_at: { type: Date, default: new Date() },
    updated_at: { type: Date },
    connections: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

// SET created_at PARAMETER EQUAL TO CURRENT TIME //
// UserSchema.pre('save', function (next) {
//     now = new Date();
//     this.updated_at = now;
//     if (!this.created_at) {
//         this.created_at = now
//     }
//     next();
// });

// INDEX THIS SCHEMA IN 2DSPHERE FORMAT (FOR PROXIMITY SEARCHES) //
UserSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', UserSchema);