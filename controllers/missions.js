const Promise = require('es6-promise').Promise
const fs = require('fs')
const User = require('../models/user')
const moment = require('moment')
const config = require('../config')
const Mission = require('../models/mission')

module.exports.getMissions = function(user, cookiesLatitude, cookiesLongitude, callback) {
  var populateMissionsPromise = new Promise(function (resolve, reject) {
    // Find nearby missions.
    var coordinatesToLookFor = {}
    if (cookiesLatitude) {
      // User location known.
      coordinatesToLookFor = { latitude: Number(cookiesLatitude), longitude: Number(cookiesLongitude) }
    } else {
      // User location unknown.
      coordinatesToLookFor = { latitude: Number(config.defaultLocation.latitude), longitude: Number(config.defaultLocation.longitude) }
    }
    // Find missions near to coordinatesToLookFor.
    Mission.find(
      {
        $and: [
          { 'location.latitude': { $gte: coordinatesToLookFor.latitude - 1 } },
          { 'location.latitude': { $lte: coordinatesToLookFor.latitude + 1 } },
          { 'location.longitude': { $gte: coordinatesToLookFor.longitude - 1 } },
          { 'location.longitude': { $lte: coordinatesToLookFor.longitude + 1 } }
        ]
      },
      function(err, queriedMissions) {
        if (err) { reject(err) }
        if (queriedMissions.length > 0) {
          // Found nearby missions!
          var missionsObject = { 'missions': [] }
          for (let queriedMission of queriedMissions) {
            // Important that the next variable is a 'let' because https://stackoverflow.com/a/43792519/964437
            // Also: https://stackoverflow.com/questions/14504385/why-cant-you-modify-the-data-returned-by-a-mongoose-query-ex-findbyid
            let mission = queriedMission.toObject()
            // Format date.
            mission.date = moment(mission.date).format('dddd, Do MMMM [at] HH:mm')
            // Get info about the creator.
            console.log(mission)
            User.findOne({ '_id': mission.creatorId }, function(err, creator) {
              if (err) { reject(err) }
              if (creator) {
                mission.creator = creator
                missionsObject.missions.push(mission)
                if (missionsObject.missions.length === queriedMissions.length) {
                  // We've populated all the queried missions into the missionsObject.missions array.
                  resolve(missionsObject)
                }
              } else {
                reject(new Error('No creator for fetched mission. That cannot be right.'))
              }
            })
          }
        } else {
          // No missions nearby. Populate sampleMissionsObject.
          var sampleMissionsObject = JSON.parse(fs.readFileSync(__dirname + '/../data/sample-missions.json', 'utf8'))
          resolve(sampleMissionsObject)
        }
      }
    )
  })
  .catch(function(error) {
    console.log(error)
  })

  var populateCreatedMissionsPromise = new Promise(function (resolve, reject) {
    if (user) {
      if (user.createdMissionIds.length > 0) {
        // User signed in.
        // Retrieve list of user's created missions including all the mission fields.
        var createdMissionsArray = []
        for (let createdMissionId of user.createdMissionIds) {
          // Fetch all created missions.
          Mission.findOne(
            {
              _id: createdMissionId
            },
            function (err, mission) {
              if (err) { reject(err) }
              if (mission) {
                createdMissionsArray.push(mission)
                if (createdMissionsArray.length === user.createdMissionIds.length) {
                  resolve(createdMissionsArray)
                }
              } else {
                reject(new Error('The user document is storing a value to an mission ID that cannot be found in the missions collection.'))
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
    if (user) {
      var joinedMissionsArray = []
      var joinedMissionsObject = { 'joinedMissions': [] }
      resolve(joinedMissionsObject)
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
    // I have to do this messy checking of values because JS doesn't support optional chaining.
    // So it can't be done in the assignments below by writing 'missions: returnedPromiseValues[0]?.missions'
    var returnedMissions
    if (returnedPromiseValues[0] && returnedPromiseValues[0].missions) {
      returnedMissions = returnedPromiseValues[0].missions
      // We don't want to add user's missions into the 'nearby missions' column.
      // Otherwise there will be duplicates in the sidebar.
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every
      var allMissionsBelongToUser
      if (user) {
        allMissionsBelongToUser = returnedMissions.every(function (mission, index, array) {
          return mission.creator.id === user.id
        })
      }
    }
    var returnedSampleMissions
    if (returnedPromiseValues[0] && returnedPromiseValues[0].sampleMissions) {
      returnedSampleMissions = returnedPromiseValues[0].sampleMissions
    }
    callback({
      missions: returnedMissions,
      allMissionsBelongToUser: allMissionsBelongToUser,
      sampleMissions: returnedSampleMissions,
      createdMissions: returnedPromiseValues[1],
      joinedMissions: returnedPromiseValues[2]
    })
  })
  .catch(function(error) {
    console.log(error); // some coding error in handling happened
  })
}

module.exports.getMission = function (user, fetchMissionId, callback) {
  Mission.findOne({ 'missionId': fetchMissionId }, function(err, mission) {
    if (err) { throw err }
    if (mission) {
      var mission = mission.toObject() // https://stackoverflow.com/questions/14504385/why-cant-you-modify-the-data-returned-by-a-mongoose-query-ex-findbyid
      // Format date.
      mission.date = moment(mission.date).format('dddd, Do MMMM [at] HH:mm')
      // Get info about the creator.
      User.findOne({ '_id': mission.creatorId }, function(err, creator) {
        if (err) { throw err }
        if (creator) {
          callback ({
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

module.exports.newMission = function (user, formData, callback) {
  if (user) {
    // Create a new mission.
    var newMission = new Mission()
    newMission.title = formData.title
    newMission.description = formData.description
    newMission.location.latitude = formData.location.latitude
    newMission.location.longitude = formData.location.longitude
    newMission.date = formData.date
    newMission.creatorId = user.id
    newMission.save(function(err) {
      if (err)
        return next(err)
      User.update(
        // Store the mission ID in the user's createdMissionsIds property.
        {
          _id: user.id
        },
        {
          "$push": { "createdMissionIds": newMission._id }
        },
        function(err, user) {
          if (err || !user) { throw err }
          callback(newMission)
        }
      )
    })
  } else {
    var err = new Error('You need to be logged in to create Missions.')
    return next(err)
  }
}
