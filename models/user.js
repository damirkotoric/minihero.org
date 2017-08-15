var mongoose = require('mongoose')

var UserSchema = new mongoose.Schema({
  fb: {
    facebookId: String,
    accessToken: String,
    firstName: String,
    lastName: String,
    email: String
  },
  location: {
    latitude: Number,
    longitude: Number
  },
  agreedToTerms: { type: Boolean, default: false },
  agreedToTermsDate: Date
})

var User = mongoose.model('User', UserSchema)
module.exports = User
