'use strict'

const moment = require('moment')
const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Mission = require('../models/mission')

var isAuthenticated = function (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if (req.isAuthenticated())
		return next()
	// if the user is not authenticated then redirect him to the login page
	res.redirect('/')
}

module.exports = function(passport) {

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
			successRedirect: '/missions',
			failureRedirect: '/facebook-login-error'
		})
  )

	// GET /legalese
  router.get('/legalese', function(req, res, next) {
    return res.render('legalese')
  })

	// GET /map
	router.get('/missions', function(req, res, next) {
	  return res.render('missions', { cookies: req.cookies, user: req.user })
	})

	// GET /mission/new
	router.get('/mission/new', function(req, res, next) {
		return res.render('mission-new', { cookies: req.cookies, user: req.user })
	})

	// POST /mission/new
	router.post('/mission/new', function(req, res, next) {
	  if (req.user) {
			var newMission = new Mission()
			newMission.title = req.body.title
			newMission.description = req.body.description
			newMission.location.latitude = req.body.location.latitude
			newMission.location.longitude = req.body.location.longitude
			newMission.date = req.body.date
			newMission.creatorId = req.user.id
			newMission.save(function(err) {
				if (err)
					return next(err)
				res.writeHead(200, {'Content-Type': 'text/json'})
				res.write(JSON.stringify(newMission))
				res.end()
			})
		} else {
			var err = new Error('You need to be logged in to create Missions.')
			return next(err)
		}
	})

	// GET /mission/id
	router.get('/mission/:id', function(req, res, next) {
		// Get the mission.
		Mission.findOne({ 'missionId': req.params.id }, function(err, mission) {
			if (err) { throw err }
			if (mission) {
				var mission = mission.toObject() // https://stackoverflow.com/questions/14504385/why-cant-you-modify-the-data-returned-by-a-mongoose-query-ex-findbyid
				// Get info about the creator.
				User.findOne({ '_id': mission.creatorId }, function(err, creator) {
					if (err) { throw err }
					if (creator) {
						// Render it.
						res.status(200)
						// Format date.
						mission.date = moment(mission.date).format('dddd, Do MMMM [at] HH:mm')
					  return res.render('mission', { user: req.user, mission: mission, creator: creator })
					} else {
						next()
					}
				})
			} else {
				next()
			}
		})
	})

	// GET /missions/id forwarder
	router.get('/missions/:id', function(req, res, next) {
		res.redirect('/mission/'+req.params.id)
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
					res.status(200)
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
