const express = require('express')
const router = express.Router()
const mid = require('../middlewares')
const User = require('../models/user')

router.use('/map', require('./map'))
router.use('/mission', require('./mission'))

var isAuthenticated = function (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if (req.isAuthenticated())
		return next()
	// if the user is not authenticated then redirect him to the login page
	res.redirect('/')
}

module.exports = function(passport){

  // GET /
  router.get('/', function(req, res, next) {
    var maximumGallerySliders = 6
    return res.render('index', { showHeroIndex: Math.floor(Math.random() * (maximumGallerySliders - 0 + 1)) + 0 })
  })

  // GET /signin
  router.get('/login/facebook',
    passport.authenticate('facebook', { scope : 'email' })
  )

	// Handle the callback after facebook has authenticated the user
	router.get('/login/facebook/callback',
		passport.authenticate('facebook', {
			successRedirect: '/map',
			failureRedirect: '/facebook-login-error'
		})
  )

	// GET /legalese
  router.get('/legalese', function(req, res, next) {
    return res.render('legalese')
  })

	// POST /agree
	router.post('/agree', function(req, res, next) {
		if (req.user) {
			User.update(
				{
					_id: req.user.id
				},
				{
					agreedToTerms: true,
					agreedToTermsDate: Date.now()
				},
				function(err, result) {
			    if(err) { throw err }
					res.status = 200
			    res.end()
			  }
			)
		} else {
	    var err = new Error('You need to be logged in to agree to terms.')
	    err.status = 401
	    return next(err)
	  }
	})

	return router
}
