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
  if (!getLocationCookie()) {
    // Only show sidebar locator panels for users without a set location cookie.
    panel.hidePanel('location-matching')
    panel.showPanel('location-matched')
    showOnboardingIfNotSignedIn()
  }
  console.log("Latitude: " + position.coords.latitude + ", Longitude: " + position.coords.longitude)
  setLocationCookie(position.coords.latitude, position.coords.longitude)
  map.setUserPosition(position.coords.latitude, position.coords.longitude)
  refreshPageIfNeeded()
}

function refreshPageIfNeeded() {
  // Detect if the user has relocated to a place on the map that contains missions,
  // but doesn't have them displayed on the page yet. In that case we'll have to
  // trigger a page refresh to show the nearby missions.
  var missions = document.getElementById('missions')
  if (missions) {
    var request = new XMLHttpRequest()
    request.open('POST', '/missions', true)
    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        // Success!
        var data = JSON.parse(request.responseText)
        if (data.missions) {
          // Only worry about possibly refreshing the page if there are mission nearby
          // worth updating for.
          if (data.missions.length > 0 && !window.missionsData) {
            // There are missions nearby, but we don't have any missionsData attached to the window.
            // This means that the page needs to be reloaded for that new missionsData to be attached.
            window.location.reload(true)
            return
          }
          if (window.missionsData) {
            if (data.missions.length != window.missionsData.length) {
              // If the newly fetched missions are more or fewer in number than the existing missionsData
              // object, then this is a clear indication that the page needs to be refreshed to update the UI.
              window.location.reload(true)
              return
            } else {
              // The newly fetched missions and the existing missionData contain the same number of missions.
              // Most likely, they are the same missions and the page doesn't need to be refreshed.
              // However, there may be an edge case where they happen to be the same in number by coincidence,
              // but the content differs. We need to check for this edge case and refresh the page if so.
              for (let newMission of data.missions) {
                var missionAlreadyExists = false
                for (let oldMission of window.missionsData) {
                  if (newMission.id === oldMission.id) {
                    missionAlreadyExists = true
                  }
                }
                if (!missionAlreadyExists) {
                  // We compared the newMission against all the missions in window.missionsData and it wasn't found.
                  // Time to update the page.
                  window.location.reload(true)
                }
              }
            }
          }
        }
      } else {
        // We reached our target server, but it returned an error
        console.log('Error fetching nearby missions.')
      }
    }
    request.onerror = function() {
      // There was a connection error of some sort
      console.log('Connection error trying to fetch nearby missions.')
    }
    request.send()
  }
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
