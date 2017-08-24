const Promise = require('es6-promise').Promise
const fs = require('fs')
const arraySort = require('array-sort')
const User = require('../models/user')
const moment = require('moment')
const config = require('../config')
const Mission = require('../models/mission')

module.exports.getMissions = function(user, cookiesLatitude, cookiesLongitude, callback) {
  var fetchMissions = new Promise(function (resolve, reject) {
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
            fetchMissionAndRelatedData(
              queriedMission.id,
              {
                fetchParticipantsData: false
              },
              function (fetchedMission) {
                missionsObject.missions.push(fetchedMission)
                if (missionsObject.missions.length === queriedMissions.length) {
                  // We've populated all the queried missions into the missionsObject.missions array.
                  // Sort the missionObjects by the mission id, then sort that array descendingly to show newest on top.
                  missionsObject.missions = arraySort(missionsObject.missions, 'mission._id', {reverse: true})
                  resolve(missionsObject)
                }
              }
            )
          }
        } else {
          // No missions nearby. Populate sampleMissionsObject.
          var sampleMissionsObject = JSON.parse(fs.readFileSync(__dirname + '/../data/sample-missions.json', 'utf8'))
          resolve(sampleMissionsObject)
        }
      }
    )
  })

  var fetchCreatedMissions = new Promise(function(resolve, reject) {
    if (user) {
      if (user.createdMissionIds.length > 0) {
        // User signed in.
        // Retrieve list of user's created missions including all the mission fields.
        var createdMissionsArray = []
        for (let createdMissionId of user.createdMissionIds) {
          // Fetch all created missions.
          fetchMissionAndRelatedData(
            createdMissionId,
            {
              fetchParticipantsData: false
            },
            function (fetchedMission) {
              createdMissionsArray.push(fetchedMission)
              if (createdMissionsArray.length === user.createdMissionIds.length) {
                createdMissionsArray = arraySort(createdMissionsArray, 'mission._id', {reverse: true})
                resolve(createdMissionsArray)
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

  var fetchJoinedMissions = new Promise(function (resolve, reject) {
    if (user) {
      if (user.joinedMissionIds.length > 0) {
        // Retrieve list of user's joined missions including all the mission fields.
        var joinedMissionsArray = []
        for (let joinedMissionId of user.joinedMissionIds) {
          fetchMissionAndRelatedData(
            joinedMissionId,
            {
              fetchParticipantsData: false
            },
            function (fetchedMission) {
              joinedMissionsArray.push(fetchedMission)
              if (joinedMissionsArray.length === user.joinedMissionIds.length) {
                joinedMissionsArray = arraySort(joinedMissionsArray, 'mission._id', {reverse: true})
                resolve(joinedMissionsArray)
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

  Promise.all([
    fetchMissions,
    fetchCreatedMissions,
    fetchJoinedMissions
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
    console.log(error)
  })
}

module.exports.getMission = function(missionUrlId, callback) {
  Mission.findOne({ 'missionId': Number(missionUrlId) }, function(err, mission) {
    // Turn the mission URL ID (like '63') into the mission.id equivalent (like '599f322be9e5de08e5a04e32'),
    // so that we can then send the query to fetch the mission.
    if (err) { reject(err) }
    if (mission) {
      fetchMissionAndRelatedData(
        mission.id,
        null,
        function (fetchedData) {
          callback(fetchedData)
        }
      )
    } else {
      reject('Could not find the mission with missionId: ' + missionUrlId)
    }
  })
}

function fetchMissionAndRelatedData(fetchMissionId, opt = {}, callback) {
  // https://stackoverflow.com/questions/9602449/a-javascript-design-pattern-for-options-with-default-values
  let defaults = {
    humanReadable: true,
    fetchCreatorData: true,
    fetchParticipantsData: true
  }
  let options = Object.assign({}, defaults, opt)

  new Promise(function(resolve, reject) {
    // Fetch the mission.
    Mission.findOne({ '_id': fetchMissionId }, function(err, mission) {
      if (err) { reject(err) }
      if (mission) {
        // This creates a nicely formatted object with a human readable mission date and location.
        // Then grabs data about the mission creator, and participants according to the options that were passed.
        mission = mission.toObject() // https://stackoverflow.com/questions/14504385/why-cant-you-modify-the-data-returned-by-a-mongoose-query-ex-findbyid
        if (options.humanReadable) {
          // Format date.
          mission.date = moment(mission.date).format('dddd, Do MMMM [at] HH:mm')
        }
        resolve(mission)
      } else {
        reject('Could not find the mission: ' + fetchMissionId)
      }
    })
  })
  .then(function(mission) {
    // Fetch creator data.
    var fetchCreator = new Promise(function(resolve, reject) {
      if (options.fetchCreatorData) {
        User.findOne({ '_id': mission.creatorId }, function(err, creator) {
          if (err) { reject(err) }
          if (creator) {
            resolve(creator)
          } else {
            reject('Could not find the creator: ' + mission.creatorId)
          }
        })
      } else {
        resolve()
      }
    })
    // Fetch participants data.
    var fetchParticipants = new Promise(function(resolve, reject) {
      if (options.fetchParticipantsData) {
        var participantsArray = []
        if (mission.participants.length > 0) {
          for (let participant of mission.participants) {
            User.findOne({ '_id': participant }, function(err, retrievedParticipant) {
              if (err) { reject(err) }
              if (retrievedParticipant) {
                participantsArray.push(retrievedParticipant)
                if (participantsArray.length === mission.participants.length) {
                  resolve(participantsArray)
                }
              }
            })
          }
        } else {
          resolve()
        }
      } else {
        resolve()
      }
    })
    Promise.all([
      fetchCreator,
      fetchParticipants
    ])
    .then(function (returnedPromiseValues) {
      // Return the mission and relevant fetched data.
      callback(
        {
          mission: mission,
          creator: returnedPromiseValues[0],
          participants: returnedPromiseValues[1]
        }
      )
    })
    .catch(function(error) {
      console.log(error)
    })
  })
  .catch(function(error) {
    console.log(error)
  })
}

module.exports.newMission = function(user, formData, callback) {
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

module.exports.joinMission = function(user, missionId, callback) {
  if (user) {
    Mission.findOneAndUpdate(
      { missionId: missionId },
      { $addToSet: { participants: user._id } },
      { new: true },
      function(err, updatedMission) {
        if (err || !updatedMission) { throw err }
        if (updatedMission) {
          User.findOneAndUpdate(
            { _id: user._id },
            { $addToSet: { joinedMissionIds: updatedMission._id } },
            { new: true },
            function(err, updatedUser) {
              if (err || !updatedUser) { throw err }
              if (updatedUser) {
                callback(true)
              }
            }
          )
        } else {
          callback(false)
        }
      }
    )
  } else {
    callback(false)
  }
}

module.exports.leaveMission = function(user, missionId, callback) {
  if (user) {
    Mission.findOneAndUpdate(
      { missionId: missionId },
      { $pull: { participants: user._id } },
      { new: true },
      function(err, updatedMission) {
        if (err || !updatedMission) { throw err }
        if (updatedMission) {
          callback(true)
        } else {
          callback(false)
        }
      }
    )
  } else {
    callback(false)
  }
}
