// Redirect traffic to https
function redirectToHTTPS(req, res, next) {
  if (!res.finished) {
    var env = process.env.NODE_ENV || 'dev'
    if (req.headers['x-forwarded-proto'] != 'https' && env != 'dev') {
      res.writeHead(302, {'Location': 'https://minihero.org' + req.url})
      res.end()
    }
  }
  next()
}

module.exports.redirectToHTTPS = redirectToHTTPS
