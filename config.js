'use strict'

var config = {}

config.facebook = {
  'appID': '261938654297222',
  'appSecret': 'cd8d0bf4ce75ae5e24be29970b79876f',
  'callbackUrl': '/login/facebook/callback/'
}

config.server = {
  'port': process.env.PORT || 3000,
  'env': process.env.NODE_ENV || 'dev',
  'dbUrl': process.env.MONGODB_URI || 'mongodb://localhost:27017/minihero',
  'sessionSecret': 'Minihero FTW!'
}

config.defaultLocation = {
  // The default location shown to signed out users on /missions is Amsterdam!
  latitude: 52.370216,
  longitude: 4.895168
}

config.apiKeys = {
  google: 'AIzaSyA4vKjKRLNIZ829rfFvz9m_-OFhiORB5Q8'
}

module.exports = config
