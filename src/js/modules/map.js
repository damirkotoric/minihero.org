'use strict'

// On the map there are a number of possible states:
// 1. Location is known.
//    1a. If missions nearby user's location, show mission pins around user's location (and don't show sample mission pins).
//    1b. If no missions nearby user's location, show sample mission pins around user's location.
// 2. Location not known.
//    2a. If missions nearby default location, show mission pins around default location (and don't show sample mission pins).
//    2b. If no missions nearby default location, show sample mission pins around default location.
// (Whether the user is signed in or not is irrelevant for the map display, because the location is retrieved using cookies.)

const panel = require('./panel.js')
const Helper = require('../utilities/helper')
const Locator = require('../utilities/locator')

var missionLocation = {}
var userLocation = {}
var miniheroMap
var pins = []
var userPin

var styles = {
  default: null,
  minihero:
  [
    {
        "featureType": "all",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            },
            {
                "saturation": "-100"
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "saturation": 36
            },
            {
                "color": "#AAAAAA"
            },
            {
                "lightness": 40
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "visibility": "off"
            },
            {
                "color": "#CCCCCC"
            },
            {
                "lightness": 10
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "lightness": 20
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "lightness": 17
            },
            {
                "weight": 1.2
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "lightness": 20
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#4d6059"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#4d6059"
            }
        ]
    },
    {
        "featureType": "landscape.natural",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#4d6059"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
            {
                "lightness": 21
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#4d6059"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#4d6059"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#7f8d89"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#7f8d89"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#7f8d89"
            },
            {
                "lightness": 17
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#7f8d89"
            },
            {
                "lightness": 29
            },
            {
                "weight": 0.2
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "lightness": 18
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#7f8d89"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#7f8d89"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "lightness": 16
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#7f8d89"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#7f8d89"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "lightness": 19
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "color": "#2b3638"
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#2b3638"
            },
            {
                "lightness": 17
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#24282b"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#24282b"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "labels.text",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    }
  ]
}

exports.drawMap = function() {
  // Check if user has location cookie set,
  // and if so update the default location
  var cookieLocation = Locator.getLocationCookie()
  if (cookieLocation) {
    userLocation.latitude = cookieLocation.latitude
    userLocation.longitude = cookieLocation.longitude
  }

  if (miniheroMap) {
    // draw map
    miniheroMap = new google.maps.Map(miniheroMap, {
      center: {lat: missionLocation.latitude || userLocation.latitude || defaultLocation.latitude, lng: missionLocation.longitude || userLocation.longitude || defaultLocation.longitude},
      zoom: 13,
      mapTypeControl: false,
      maxZoom: 15,
      streetViewControl: false,
      zoomControl: false,
      backgroundColor: '#444444',
      scrollwheel: false,
      disableDoubleClickZoom: true,
      fullscreenControl: false,
      clickableIcons: false
    })
    // set theme
    miniheroMap.setOptions({styles: styles['minihero']})
    addMarkers()
    window.onresize = panMapToCenter
    panMapToCenter()
  }
}

exports.init = function() {
  miniheroMap = document.getElementById('map__container')
  if (miniheroMap) {
    // Custom marker implementation from https://humaan.com/blog/custom-html-markers-google-maps/
    CustomMarker.prototype = new google.maps.OverlayView()
    CustomMarker.prototype.draw = function() {
    	var self = this
    	var div = this.div
    	if (!div) {
    		div = this.div = document.createElement('div')
        var avatar = document.createElement('img')
        avatar.className = 'avatar --small'
        avatar.src = self.args.avatar
        div.appendChild(avatar)
    		div.className = 'map__pin'
    		if (typeof(self.args.marker_id) !== 'undefined') {
    			div.dataset.marker_id = self.args.marker_id
    		}
    		google.maps.event.addDomListener(div, 'click', function(event) {
    			google.maps.event.trigger(self, 'click')
    		})
    		var panes = this.getPanes()
    		panes.overlayMouseTarget.appendChild(div)
        var me = this
        google.maps.event.addDomListener(div, 'click', function() {
          google.maps.event.trigger(me, 'click')
          window.location = '/mission/' + div.getAttribute('data-marker_id')
        })
    	}
    	var point = this.getProjection().fromLatLngToDivPixel(this.latlng)
    	if (point) {
    		div.style.left = point.x + 'px'
    		div.style.top = point.y + 'px'
    	}
    }
    CustomMarker.prototype.remove = function() {
    	if (this.div) {
    		this.div.parentNode.removeChild(this.div)
    		this.div = null
    	}
    }
    CustomMarker.prototype.getPosition = function() {
    	return this.latlng
    }

    // User marker implementation
    UserMarker.prototype = new google.maps.OverlayView()
    UserMarker.prototype.draw = function() {
      var self = this
      var div = this.div
      if (!div) {
        div = this.div = document.createElement('div')
        div.className = 'map__user'
      }
      google.maps.event.addDomListener(div, 'click', function(event) {
        google.maps.event.trigger(self, 'click')
      })
      var panes = this.getPanes()
      panes.overlayImage.appendChild(div)
      var point = this.getProjection().fromLatLngToDivPixel(this.latlng)
      if (point) {
    		div.style.left = point.x + 'px'
    		div.style.top = point.y + 'px'
    	}
    }
    UserMarker.prototype.remove = function() {
    	if (this.div) {
    		this.div.parentNode.removeChild(this.div)
    		this.div = null
    	}
    }
    UserMarker.prototype.getPosition = function() {
    	return this.latlng
    }

    // Draw the map
    this.drawMap()
  } else {
    console.log("Error: No map element in HTML")
  }
}

function CustomMarker(latlng, map, args) {
	this.latlng = latlng
	this.args = args
	this.setMap(map)
}

function UserMarker(latlng, map, args) {
	this.latlng = latlng
	this.args = args
	this.setMap(map)
}

function addMarkers() {
  var missions = document.getElementById('missions')
  if (missions) {
    clearAllMarkers()
    // First, detect whether to add the markers around user's location or default location.
    var baseLatitude
    var baseLongitude
    // Next, render the appropriate markers.
    if (window.missionsData) {
      // Nearby missions. Add mission markers.
      // No nearby missions. Add sample mission markers.
      Array.prototype.forEach.call(window.missionsData, function(mission, i) {
        var overlay = new CustomMarker(
          new google.maps.LatLng(mission.location.latitude, mission.location.longitude),
          miniheroMap,
          {
            marker_id: mission.missionId,
            avatar: 'https://graph.facebook.com/' + mission.creator.fb.facebookId + '/picture?type=large'
          }
        )
        pins.push(overlay)
      })
    }
    if (window.sampleMissionsData) {
      // No nearby missions. Add sample mission markers.
      if (userLocation.latitude) {
        // Location is shared. Set sample markers around user's location.
        baseLatitude = userLocation.latitude
        baseLongitude = userLocation.longitude
      } else {
        // Location not shared. Set sample markers around default location.
        baseLatitude = defaultLocation.latitude
        baseLongitude = defaultLocation.longitude
      }
      Array.prototype.forEach.call(window.sampleMissionsData, function(sampleMission, i) {
        var overlay = new CustomMarker(
          new google.maps.LatLng(baseLatitude + Number(sampleMission.location.latitudeOffset), baseLongitude + Number(sampleMission.location.longitudeOffset)),
          miniheroMap,
          {
            marker_id: sampleMission.missionId,
            avatar: sampleMission.creator.imageUrl
          }
        )
        pins.push(overlay)
      })
    }
  }
  var mission = document.getElementById('mission')
  if (mission) {
    clearAllMarkers()
    var overlay = new CustomMarker(
      new google.maps.LatLng(missionLocation.latitude, missionLocation.longitude),
      miniheroMap,
      {
        marker_id: mission.getAttribute('data-mission-id'),
        avatar: document.getElementById('creator-avatar').getAttribute('src')
      }
    )
    pins.push(overlay)
  }
}

function clearAllMarkers() {
  // Clears all markers including sample mission and mission pins, on individual mission pages and on /missions.
  // This is the simplest way of ensuring that we never add a duplicate pin.
  while(pins[0]) {
    pins.pop().setMap(null)
  }
}

exports.setUserPosition = function(lat, lng) {
  userLocation.latitude = lat
  userLocation.longitude = lng
  if (!userPin) {
    userPin = new UserMarker(
      new google.maps.LatLng(lat, lng),
      miniheroMap
    )
  }
  // Redraw the sample markers now that we have the user's location.
  addMarkers()
  if (!missionLocation.latitude) {
    // Only initiate a pan if the user isn't looking at a mission
    panMapToCenter()
  }
}

function panMapToCenter(event = null, latitude = missionLocation.latitude || userLocation.latitude || defaultLocation.latitude, longitude = missionLocation.longitude || userLocation.longitude || defaultLocation.longitude) {
  if (window.innerWidth < 900) {
    miniheroMap.setCenter({lat: latitude, lng: longitude})
    miniheroMap.panBy(0, 50)
  } else if (window.innerWidth >= 900) {
    miniheroMap.setCenter({lat: latitude, lng: longitude})
    miniheroMap.panBy(150, 0)
  }
}

exports.updateIfNeeded = function() {
  // Check if we're on a mission page with its own geocoordinates.
  // Mission location takes precedence over user location when
  // rendering the map.
  var mission = document.querySelector('.mission')
  if (mission) {
    if (mission.getAttribute('data-is-sample-mission') === "yes") {
      // For sample missions.
      missionLocation.latitude = (userLocation.latitude || defaultLocation.latitude) + Number(mission.getAttribute('data-location-latitude-offset'))
      missionLocation.longitude = (userLocation.longitude || defaultLocation.longitude) + Number(mission.getAttribute('data-location-longitude-offset'))
    } else {
      // For real missions.
      missionLocation.latitude = Number(mission.getAttribute('data-location-latitude'))
      missionLocation.longitude = Number(mission.getAttribute('data-location-longitude'))
    }
  } else {
    // Remove any previous reference to missionLocation.
    // In case a user navigates away form a mmission using Turbolinks.
    missionLocation = {}
  }
  if (miniheroMap) {
    // console.log('about to update')
    if (document.getElementById('missions')) {
      if (Locator.getLocationCookie()) {
        // console.log('show user location')
        // Show missions around the user location.
        addMarkers()
        panMapToCenter(null, userLocation.latitude, userLocation.longitude)
      } else {
        // console.log('show default location')
        // Show missions around the default location.
        addMarkers()
        panMapToCenter(null, defaultLocation.latitude, defaultLocation.longitude)
      }
    }
    if (document.getElementById('mission')) {
      // console.log('show mission location')
      // Show the mission.
      addMarkers()
      panMapToCenter(null, missionLocation.latitude, missionLocation.longitude)
    }
  } else {
    console.log('no miniheroMap defined')
  }
}
