'use strict'

const map = require('../modules/map')

var userLocation

function getLocation(e) {
  if (e) {
    e.preventDefault()
  }
  if (navigator.geolocation) {
    hidePanel('location-access-needed')
    hidePanel('location-access-denied')
    showPanel('matching-location')
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
  hidePanel('matching-location')
  showPanel('matched-location')
  console.log("Latitude: " + position.coords.latitude + ", Longitude: " + position.coords.longitude)
  map.moveToPosition(position.coords.latitude, position.coords.longitude)
}

function displayError(error) {
  var errors = {
    1: 'Permission denied',
    2: 'Position unavailable',
    3: 'Request timeout'
  }
  console.log("Location Access Error: " + errors[error.code])
  if (error.code == 1) {
    hidePanel('location-access-needed')
    showPanel('location-access-denied')
  } else if (error.code == 2) {
    hidePanel('matching-location')
    showPanel('location-unavailable')
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
    showPanel('location-access-needed')
  }
}
