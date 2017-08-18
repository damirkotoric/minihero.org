'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session) // Helps store sessions in a database so we don't crash the server by storing them in server RAM
const flash = require('connect-flash')
const cookieParser = require('cookie-parser')
const config = require('./config')

const app = express()
const port = config.server.port

// mongodb connection
mongoose.connect(config.server.dbUrl)
const db = mongoose.connection
// mongo error
db.on('error', console.error.bind(console, 'connection error: '))

// Easily access and set cookies
app.use(cookieParser())

// use sessions for tracking logins
app.use(session({
  secret: config.server.sessionSecret,
  maxAge: null,
  resave: true, // force session to be saved in the sessions store whether anything changed in the request or not
  saveUninitialized: true,
  store: new MongoStore({
    mongooseConnection: db
  })
}))

app.use(passport.initialize())
app.use(passport.session())

// parse incoming requests
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// serve static files from /public
app.use(express.static(__dirname + '/public'))

// view engine setup
app.set('view engine', 'pug')
app.set('views', __dirname + '/views')

// Using the flash middleware provided by connect-flash to store messages in session
// and displaying in templates
app.use(flash())

// https://www.tonyerwin.com/2014/09/redirecting-http-to-https-with-nodejs.html
app.enable('trust proxy')
app.use (function (req, res, next) {
  if (req.secure || config.server.env === 'dev') {
    // request was via https, so do no special handling
    next();
  } else {
    // request was via http, so redirect to https
    res.redirect('https://' + req.headers.host + req.url);
  }
})

// Initialize Passport
const initPassport = require('./controllers/passport/init')
initPassport(passport)

// include routes
const routes = require('./controllers/index')(passport)
app.use('/', routes)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('File not found.')
  err.status = 404
  next(err)
})

// error handler
// define as the last app.use callback
app.use(function(err, req, res, next) {
  res.status(err.status || 500)
  res.render('error', {
    status: err.status,
    message: err.message,
    error: {}
  })
})

app.listen(port, function() {
  console.log('Express app listening on port ' + config.server.port)
})
