'use strict'

const panel = require('../modules/panel')
const Helper = require('../utilities/helper')
var autocomplete

exports.init = function() {
  var missionJoin = document.querySelector('a[data-mission-join]')
  if (missionJoin) {
    missionJoin.addEventListener('click', joinMission)
  }

  var missionLeave = document.querySelector('a[data-mission-leave]')
  if (missionLeave) {
    missionLeave.addEventListener('click', leaveMission)
  }

  var missionTitle = document.getElementById('mission_title')
  if (missionTitle) {
    missionTitle.focus()
    missionTitle.select()
  }

  var missionCreateSendLink = document.querySelector('a[data-mission-create-send]')
  if (missionCreateSendLink) {
    missionCreateSendLink.addEventListener('click', saveMission)
  }

  var missionCreateSendLink = document.querySelector('a[data-mission-create-send]')
  if (missionCreateSendLink) {
    missionCreateSendLink.addEventListener('click', saveMission)
  }

  var missionUpdateSendLink = document.querySelector('a[data-mission-update-send]')
  if (missionUpdateSendLink) {
    missionUpdateSendLink.addEventListener('click', saveMission)
  }

  var input = document.getElementById('mission_location')
  if (input && window.google) {
    autocomplete = new google.maps.places.Autocomplete(input)
  }
}

function joinMission(e) {
  e.preventDefault()
  var href = e.currentTarget.href
  var missionDiv = e.currentTarget.closest('.mission')
  Helper.addClass(missionDiv, '--joining')
  setTimeout(function() {
    Helper.removeClass(missionDiv, '--joining')
    Turbolinks.visit(href)
  }, 1500)
}

function leaveMission(e) {
  e.preventDefault()
  var href = e.currentTarget.href
  var missionDiv = e.currentTarget.closest('.mission')
  Helper.addClass(missionDiv, '--leaving')
  setTimeout(function() {
    Helper.removeClass(missionDiv, '--leaving')
    Turbolinks.visit(href)
  }, 1500)
}

// For both new missions and updating missions.
function saveMission(e) {
  e.preventDefault()

  // Check that all form elements have been properly entered
  var missionTitle = document.getElementById('mission_title')
  if (missionTitle.value === '') {
    return
  }
  var missionDescription = document.getElementById('mission_description')
  if (missionDescription.value === '') {
    return
  }
  var missionLocation = document.getElementById('mission_location')
  if (missionLocation.value === '') {
    return
  }
  var missionDate = document.getElementById('mission_date')
  if (missionDate.value === '') {
    return
  }
  var missionTime = document.getElementById('mission_time')
  if (missionTime.selectedIndex === 0) {
    return
  }

  new Promise(function(resolve, reject) {
    // Get the place info.
    var place = autocomplete.getPlace()
    if (place) {
      // User selected a place.
      resolve(place)
    } else {
      if (window.missionData) {
        // An existing location has already been chosen previously, set 'place' to that one.
        autocomplete.set('place', window.missionData.place)
        resolve(window.missionData.place)
      } else {
        reject('need to select a location')
      }
    }
  }).then(
    function(place) {
      // Successful promise.
      // Send AJAX request.
      Helper.addClass(e.currentTarget, '--loading')
      var mission = {}
      mission.title = missionTitle.value.trim()
      mission.description = missionDescription.value.trim()
      mission.place = place
      mission.date = missionDate.value.trim() + 'T' + missionTime.value + ':00.000Z'
      var request = new XMLHttpRequest()
      if (e.currentTarget.getAttribute('data-mission-create-send')) {
        request.open('POST', '/mission/new', true)
      }
      if (e.currentTarget.getAttribute('data-mission-update-send')) {
        mission.missionId = window.missionData.missionId
        request.open('POST', '/mission/' + mission.missionId + '/update', true)
      }
      request.setRequestHeader('Content-type', 'application/json')
      request.onload = function() {
        var returnedMission = JSON.parse(request.responseText)
        // Done
        if (request.readyState == 4 && request.status == 200) {
          debugger
          window.location = '/mission/' + returnedMission.missionId
        }
      }
      request.onerror = function() {
        // There was a connection error of some sort
        console.log('connection error')
      }
      request.send(JSON.stringify(mission))
    },
    function(reason) {
      // Rejected promise.
      console.log(reason)
    }
  )
  .catch(function(error) {
    console.log(error)
  })
}
