'use strict'

const Helper = require('../utilities/helper')
const map = require('../modules/map')
const panel = require('../modules/panel')
const onboarding = require('../modules/onboarding')

function getLocation(e) {
  if (e) {
    e.preventDefault()
  }
  if (navigator.geolocation) {
    panel.hidePanel('location-access-needed')
    panel.hidePanel('location-access-denied')
    panel.hidePanel('location-unavailable')
    // Don't show the sidebar locator panels for repeat users
    if (!getLocationCookie()) {
      panel.showPanel('location-matching')
    } else {
      // Location is set in cookie
      showOnboardingIfNotSignedIn()
    }
    var timeoutVal = 10 * 1000 * 1000
    navigator.geolocation.getCurrentPosition(
      displayUserPosition,
      displayError,
      { enableHighAccuracy: true, timeout: timeoutVal, maximumAge: 0 }
    )
  }
  else {
    console.log("Geolocation is not supported by this browser")
  }
}

function displayUserPosition(position) {
  Helper.addClass(document.body, 'user-allowed-location')
  // Don't show the sidebar locator panels for repeat users
  if (!getLocationCookie()) {
    panel.hidePanel('location-matching')
    panel.showPanel('location-matched')
    showOnboardingIfNotSignedIn()
  }
  console.log("Latitude: " + position.coords.latitude + ", Longitude: " + position.coords.longitude)
  setLocationCookie(position.coords.latitude, position.coords.longitude)
  map.setUserPosition(position.coords.latitude, position.coords.longitude)
}

function showOnboardingIfNotSignedIn() {
  if (!document.body.classList.contains('user-logged-in')) {
    // if not a user
    onboarding.start('onboarding-location-matched')
  }
  if (document.body.classList.contains('user-logged-in') && !document.body.classList.contains('user-agreed-terms')) {
    // if user but not agreed to terms
    onboarding.start('onboarding-synched')
  }
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
    panel.hidePanel('location-matching')
    panel.showPanel('location-access-denied')
  } else if (error.code == 2) {
    panel.hidePanel('location-access-needed')
    panel.hidePanel('location-matching')
    panel.showPanel('location-unavailable')
  }
}

function setLocationCookie(latitude, longitude) {
  document.cookie = "latitude=" + latitude
  document.cookie = "longitude=" + longitude
}
exports.setLocationCookie = setLocationCookie

function getLocationCookie() {
  var cookieLatitude = Number(Helper.getCookie('latitude'))
  var cookieLongitude = Number(Helper.getCookie('longitude'))
  if (cookieLatitude && cookieLongitude) {
    return {latitude: cookieLatitude, longitude: cookieLongitude}
  } else {
    return false
  }
}
exports.getLocationCookie = getLocationCookie

exports.init = function() {
  document.getElementById('allow-location-access').addEventListener('click', getLocation)
  document.getElementById('retry-location-access').addEventListener('click', getLocation)
  if (getLocationCookie()) {
    Helper.addClass(document.body, 'user-allowed-location')
    // User has a location cookie already set
    // Get their location again in case the user moved
    getLocation()
  } else {
    panel.showPanel('location-access-needed')
  }
}
