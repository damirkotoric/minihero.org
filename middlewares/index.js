const config = require('../config')

// Redirect traffic to https
function redirectToHTTPS(req, res, next) {
  if (!res.finished) {
    if (req.headers['x-forwarded-proto'] != 'https' && config.server.env != 'dev') {
      res.writeHead(302, {'Location': 'https://minihero.org' + req.url})
      res.end()
    }
  }
  next()
}

module.exports.redirectToHTTPS = redirectToHTTPS
