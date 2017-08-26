const User = require('../models/user')

module.exports.markAsAgreedToTerms = function (user, callback) {
  if (user) {
    User.update(
      {
        _id: user.id
      },
      {
        agreedToTerms: true,
        agreedToTermsDate: Date.now()
      },
      { new: true },
      function(err, updatedUser) {
        if(err) { callback(err) }
        if (updatedUser.agreedToTerms === true) {
          callback(true)
        } else {
          var err = new Error('User was not updated to have agreed to terms.')
          callback(err)
        }
      }
    )
  } else {
    var err = new Error('Problem fetching the user.')
    callback(err)
  }
}
