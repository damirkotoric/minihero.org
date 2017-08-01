'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session) // Helps store sessions in a database so we don't crash the server by storing them in server RAM
const app = express()

// mongodb connection
mongoose.connect('mongodb://localhost:27017/minihero')
const db = mongoose.connection
// mongo error
db.on('error', console.error.bind(console, 'connection error: '))

// parse incoming requests
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// serve static files from /public
app.use(express.static(__dirname + '/public'))

// view engine setup
app.set('view engine', 'pug')
app.set('views', __dirname + '/views')

// include routes
const routes = require('./controllers/index')
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

// listen on port 3000
app.listen(3000, function() {
  console.log('Express app listening on port 3000')
})
