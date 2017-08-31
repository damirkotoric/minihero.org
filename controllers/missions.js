const Promise = require('es6-promise').Promise
const fs = require('fs')
const arraySort = require('array-sort')
const config = require('../config')
const googleMapsClient = require('@google/maps').createClient({ key: config.apiKeys.google })
const User = require('../models/user')
const moment = require('moment')
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
          { 'place.geometry.location.lat': { $gte: coordinatesToLookFor.latitude - 1 } },
          { 'place.geometry.location.lat': { $lte: coordinatesToLookFor.latitude + 1 } },
          { 'place.geometry.location.lng': { $gte: coordinatesToLookFor.longitude - 1 } },
          { 'place.geometry.location.lng': { $lte: coordinatesToLookFor.longitude + 1 } }
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
    // debugger
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
    if (err) { callback(err) }
    if (mission) {
      fetchMissionAndRelatedData(
        mission.id,
        null,
        function (fetchedData) {
          callback(fetchedData)
        }
      )
    } else {
      var err = new Error('Could not find the mission with missionId: ' + missionUrlId)
      callback(err)
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
        if (options.humanReadable) {
          // This creates a nicely formatted object with a human readable mission date and location.
          // Then grabs data about the mission creator, and participants according to the options that were passed.
          mission = mission.toObject() // https://stackoverflow.com/questions/14504385/why-cant-you-modify-the-data-returned-by-a-mongoose-query-ex-findbyid
          // Format date.
          mission.formattedDate = {}
          // http://blog.skylight.io/bringing-sanity-to-javascript-utc-dates-with-moment-js-and-ember-data/
          mission.formattedDate.readableDate = moment.utc(mission.date).format('dddd, Do MMMM [at] HH:mm')
          mission.formattedDate.year = moment.utc(mission.date).format('YYYY')
          mission.formattedDate.month = moment.utc(mission.date).format('MM')
          mission.formattedDate.day = moment.utc(mission.date).format('DD')
          mission.formattedDate.hour = moment.utc(mission.date).format('HH')
          mission.formattedDate.minute = moment.utc(mission.date).format('mm')
          mission.formattedDate.second = moment.utc(mission.date).format('ss')
          resolve(mission)
        } else {
          resolve(mission)
        }
      } else {
        var err = new Error('Could not find the creator.')
        reject(err)
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
            var err = new Error('Could not find the creator: ' + mission.creatorId)
            reject(err)
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
    newMission.place = formData.place
    newMission.date = formData.date
    newMission.creatorId = user.id
    // Fetch the timezone name for this location.
    googleMapsClient.timezone({
      location: {
        latitude: newMission.place.geometry.location.lat,
        longitude: newMission.place.geometry.location.lng
      },
      timestamp: newMission.date,
      language: 'en'
    }, function(err, response) {
      if (err)
        return callback(err)
      newMission.place.timeZoneId = response.json.timeZoneId
      newMission.save(function(err) {
        // Save the mission.
        if (err)
          return callback(err)
        User.findOneAndUpdate(
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
    })
  } else {
    var err = new Error('You need to be logged in to create Missions.')
    return callback(err)
  }
}

module.exports.updateMission = function(user, formData, callback) {
  if (user) {
    // Fetch the timezone name for this location.
    googleMapsClient.timezone({
      location: {
        latitude: formData.place.geometry.location.lat,
        longitude: formData.place.geometry.location.lng
      },
      timestamp: moment(formData.date).unix(),
      language: 'en'
    }, function(err, response) {
      if (err)
        return callback(err)
      formData.place.timeZoneId = response.json.timeZoneId
      // Update the mission.
      Mission.findOneAndUpdate(
        {
          missionId: Number(formData.missionId)
        },
        {
          title: formData.title,
          description: formData.description,
          place: formData.place,
          date: formData.date
        },
        { new: true },
        function(err, updatedMission) {
          if (err || !updatedMission) { throw err }
          callback(updatedMission)
        }
      )
    })
  } else {
    var err = new Error('You need to be logged in to update Missions.')
    return callback(err)
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
