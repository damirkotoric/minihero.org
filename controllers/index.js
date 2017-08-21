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

		var populateMissionsPromise = new Promise(function (resolve, reject) {
			// Find nearby missions.
			var coordinatesToLookFor = {}
			if (req.cookies.latitude) {
				// User location known.
				coordinatesToLookFor = { latitude: req.cookies.latitude, longitude: req.cookies.longitude }
			} else {
				// User location unknown.
				coordinatesToLookFor = { latitude: config.defaultLocation.latitude, longitude: config.defaultLocation.longitude }
			}
			// Todo: Find missions near to coordinatesToLookFor.

			var thereAreMissionsNearby = false
			if (thereAreMissionsNearby) {
				// Populate nearbyMissionsArray.
				// resolve(nearbyMissionsArray)
			} else {
				// No missions nearby. Populate sampleMissionsObject.
				var sampleMissionsObject = JSON.parse(fs.readFileSync(__dirname + '/../data/sample-missions.json', 'utf8'))
				resolve(sampleMissionsObject)
			}
		})
		.catch(function(error) {
			console.log(error)
		})

		var populateCreatedMissionsPromise = new Promise(function (resolve, reject) {
			if (req.user) {
				if (req.user.createdMissionIds.length > 0) {
					// User signed in.
					// Retrieve list of user's created missions including all the mission fields.
					var createdMissionsArray = []
					for (let createdMissionId of req.user.createdMissionIds) {
						// Fetch all created missions.
						Mission.findOne(
							{
								_id: createdMissionId
							},
							function (err, mission) {
								if (err) { reject(err) }
								if (mission) {
									res.status(200)
									createdMissionsArray.push(mission)
									if (createdMissionsArray.length === req.user.createdMissionIds.length) {
										resolve(createdMissionsArray)
									}
								} else {
									resolve()
								}
							}
						)
					}
				} else {
					resolve()
				}
			} else {
				resolve()
			}
		})
		.catch(function(error) {
			console.log(error)
		})

		var populateJoinedMissionsPromise = new Promise(function (resolve, reject) {
			if (req.user) {
				var joinedMissionsArray = []
				resolve()
			} else {
				resolve()
			}
		})
		.catch(function(error) {
			console.log(error)
		})

		Promise.all([
			populateMissionsPromise,
			populateCreatedMissionsPromise,
			populateJoinedMissionsPromise
		])
		.then(function (returnedPromiseValues) {
			return res.render(
				'missions',
				{
					cookies: req.cookies,
					user: req.user,
					defaultLocation: config.defaultLocation,
					missions: returnedPromiseValues[0].missions,
					sampleMissions: returnedPromiseValues[0].sampleMissions,
					createdMissions: returnedPromiseValues[1],
					joinedMissions: returnedPromiseValues[2]
				}
			)
		})
		.catch(function(error) {
		  console.log(error); // some coding error in handling happened
		})
	})

	// GET Forwarding /missions/id to /mission/id
	router.get('/missions/:id', function(req, res, next) {
		res.redirect('/mission/'+req.params.id)
	})

	// GET /mission/new
	router.get('/mission/new', function(req, res, next) {
		return res.render('mission-new', { cookies: req.cookies, user: req.user })
	})

	// GET /mission/id
	router.get('/mission/:id', function(req, res, next) {
		if (req.params.id.includes('sample-')) {
			// Sample mission. Grab the JSON data.
			var sampleMissionsObject = JSON.parse(fs.readFileSync(__dirname + '/../data/sample-missions.json', 'utf8'))
			var missionId = Number(req.params.id.replace('sample-', ''))
			var sampleMission = sampleMissionsObject.sampleMissions[missionId - 1]
			return res.render('mission', {
				user: req.user,
				defaultLocation: config.defaultLocation,
				mission: sampleMission,
				creator: sampleMission.creator,
				isSampleMission: true
			})
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
						  return res.render('mission',
								{
									user: req.user,
									defaultLocation: config.defaultLocation,
									mission: mission,
									creator: creator
								})
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
