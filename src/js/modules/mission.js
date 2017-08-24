'use strict'

const panel = require('../modules/panel')
const Helper = require('../utilities/helper')
var autocomplete

exports.init = function() {
  var missionJoinLinks = document.querySelectorAll('a[data-mission-join]')
  Array.prototype.forEach.call(missionJoinLinks, function(el, i) {
    el.addEventListener('click', joinMission)
  })

  var missionTitle = document.getElementById('mission_title')
  if (missionTitle) {
    missionTitle.focus()
  }

  var missionCreateSendLink = document.querySelector('a[data-mission-create-send]')
  if (missionCreateSendLink) {
    missionCreateSendLink.addEventListener('click', createMission)
  }

  var input = document.getElementById('mission_location')
  if (input && window.google) {
    autocomplete = new google.maps.places.Autocomplete(input)
  }
}

function joinMission(e) {
  e.preventDefault()
  // Check authentication
  if (document.body.classList.contains('user-logged-in')) {
    // Join user to mission
    Helper.addClass(e.currentTarget.closest('.mission'), '--joining')
  } else {
    window.location = '/login/facebook'
  }
}

function createMission(e) {
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
  var place = autocomplete.getPlace()
  if (!place || !place.geometry.location.lat() || !place.geometry.location.lng()) {
    console.log('need to select a location')
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

  // Send AJAX request.
  Helper.addClass(e.currentTarget, '--loading')
  var mission = {}
  mission.title = missionTitle.value.trim()
  mission.description = missionDescription.value.trim()
  mission.location = {}
  mission.location.latitude = place.geometry.location.lat()
  mission.location.longitude = place.geometry.location.lng()
  mission.date = missionDate.value.trim() + 'T' + missionTime.value + ':00.000Z'

  var request = new XMLHttpRequest()
  request.open('POST', '/mission/new', true)
  request.setRequestHeader('Content-type', 'application/json')
  request.onload = function() {
    var createdMission = JSON.parse(request.responseText)
    // Done
    if (request.readyState == 4 && request.status == 200) {
      window.location = '/mission/' + createdMission.missionId
    }
  }
  request.onerror = function() {
    // There was a connection error of some sort
    console.log('connection error')
  }
  request.send(JSON.stringify(mission))
}
