'use strict'

const moment = require('moment')
const express = require('express')
const router = express.Router()
const fs = require('fs')
const Promise = require('es6-promise').Promise;
const User = require('../models/user')
const Mission = require('../models/mission')
const config = require('../config')

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

	// GET /missions
	// See /src/js/modules/map.js for documentation on the logic for fetching missions.
	router.get('/missions', function(req, res, next) {
		// TODO figure out how to detect nearby missions
		var nearbyMissionsArray = []
		var sampleMissionsObject = {}
		var createdMissionsArray = []

		if (req.cookies.latitude) {
			// User location is known.
			// TODO check for nearby missions and append to nearbyMissionsArray.

			if (nearbyMissionsArray.length > 0) {
				// Missions nearby the user's location.
				// TODO retrieve the nearby missions and assign to nearbyMissionsArray.

			} else {
				// Retrieve the sample missions.
				sampleMissionsObject = JSON.parse(fs.readFileSync(__dirname + '/../data/sample-missions.json', 'utf8'))
			}
			if (req.user) {
				// User signed in.
				// Retrieve list of user's created missions including all the mission fields.
				for (let createdMissionId of req.user.createdMissionIds) {
					createdMissionsArray = []
					// Fetch all created missions.
					Mission.findOne(
						{
							_id: createdMissionId
						},
						function (err, mission) {
							if (err) { throw err }
							if (mission) {
								res.status(200)
								createdMissionsArray.push(mission)
								if (createdMissionsArray.length === req.user.createdMissionIds.length) {
									// User location is known, user is signed in.
									return res.render('missions', { cookies: req.cookies, user: req.user, defaultLocation: config.defaultLocation, createdMissions: createdMissionsArray, sampleMissions: sampleMissionsObject, nearbyMissions: nearbyMissionsArray })
								}
							} else {
								next()
							}
						}
					)
				}
			} else {
				// User location is known, user not signed in.
				return res.render('missions', { cookies: req.cookies, user: false, defaultLocation: config.defaultLocation, createdMissions: false, sampleMissions: sampleMissionsObject, nearbyMissions: nearbyMissionsArray })
			}
		} else {
			// User location not known.
			if(nearbyMissionsArray.length > 0) {
				// Missions nearby the default location.
				// TODO retrieve the nearby missions and assign to nearbyMissionsArray.

			} else {
				// No missions nearby the default location.
				// Retrieve the sample missions.
				sampleMissionsObject = JSON.parse(fs.readFileSync(__dirname + '/../data/sample-missions.json', 'utf8'))
				// User location not known, no nearby missions. Show sample missions around default location.
				return res.render('missions', { cookies: req.cookies, user: false, defaultLocation: config.defaultLocation, createdMissions: false, sampleMissions: sampleMissionsObject, nearbyMissions: false })
			}
		}
	})

	// GET /mission/new
	router.get('/mission/new', function(req, res, next) {
		return res.render('mission-new', { cookies: req.cookies, user: req.user })
	})

	// POST /mission/new
	router.post('/mission/new', function(req, res, next) {
	  if (req.user) {
			// Create a new mission.
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
				User.update(
					// Store the mission ID in the user's createdMissionsIds property.
					{
						_id: req.user.id
					},
					{
						"$push": { "createdMissionIds": newMission._id }
					},
					function(err, user) {
						if (err || !user) { throw err }
						res.writeHead(200, {'Content-Type': 'text/json'})
						res.write(JSON.stringify(newMission))
						res.end()
					}
				)
			})
		} else {
			var err = new Error('You need to be logged in to create Missions.')
			return next(err)
		}
	})

	// GET /mission/id
	router.get('/mission/:id', function(req, res, next) {
		if (req.params.id.includes('sample-')) {
			// Sample mission. Grab the JSON data.
			var sampleMissions = JSON.parse(fs.readFileSync(__dirname + '/../data/sample-missions.json', 'utf8'))
			var missionId = Number(req.params.id.replace('sample-', ''))
			var sampleMission = sampleMissions.missions[missionId - 1]
			return res.render('mission', { mission: sampleMission, creator: sampleMission.creator, isSampleMission: true })
		} else {
			// Real mission. Retrieve it from the database.
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
						  return res.render('mission', { user: req.user, mission: mission, creator: creator, isSampleMission: false })
						} else {
							next()
						}
					})
				} else {
					next()
				}
			})
		}
	})

	// GET Forwarding /missions/id to /mission/id
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
