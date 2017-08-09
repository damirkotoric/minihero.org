'use strict'

const map = require('../modules/map')
const panel = require('../modules/panel')

var userLocation

function getLocation(e) {
  if (e) {
    e.preventDefault()
  }
  if (navigator.geolocation) {
    panel.hidePanel('location-access-needed')
    panel.hidePanel('location-access-denied')
    panel.hidePanel('location-unavailable')
    panel.showPanel('matching-location')
    var timeoutVal = 10 * 1000 * 1000
    navigator.geolocation.getCurrentPosition(
      displayPosition,
      displayError,
      { enableHighAccuracy: true, timeout: timeoutVal, maximumAge: 0 }
    )
  }
  else {
    console.log("Geolocation is not supported by this browser")
  }
}

function displayPosition(position) {
  if (!userLocation) {
    userLocation = position
  }
  panel.hidePanel('matching-location')
  panel.showPanel('matched-location')
  console.log("Latitude: " + position.coords.latitude + ", Longitude: " + position.coords.longitude)
  map.setUserPosition(position.coords.latitude, position.coords.longitude)
}

function displayError(error) {
  var errors = {
    1: 'Permission denied',
    2: 'Position unavailable',
    3: 'Request timeout'
  }
  console.log("Location Access Error: " + errors[error.code])
  if (error.code == 1) {
    panel.hidePanel('location-access-needed')
    panel.hidePanel('matching-location')
    panel.showPanel('location-access-denied')
  } else if (error.code == 2) {
    panel.hidePanel('location-access-needed')
    panel.hidePanel('matching-location')
    panel.showPanel('location-unavailable')
  }
}

exports.init = function() {
  document.getElementById('allow-location-access').addEventListener('click', getLocation)
  document.getElementById('retry-location-access').addEventListener('click', getLocation)
  if (userLocation) {
    // show the user's position
    displayPosition()
  } else {
    // get the user's location, then return it
    panel.showPanel('location-access-needed')
  }
}
