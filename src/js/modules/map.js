'use strict'

// On the map there are a number of possible states:
// 1. Location is shared.
//    1a. If missions nearby user's location, show mission pins around user's location (and don't show sample mission pins).
//    1b. If no missions nearby user's location, show sample mission pins around user's location.
// 2. Location not shared.
//    2a. If missions nearby default location, show mission pins aroud default location (and don't show sample mission pins).
//    2b. If no missions nearby default location, show sample mission pins around default location.
// (Whether the user is signed in or not is irrelevant for the map display, because the location is retrieved using cookies.)

const panel = require('./panel.js')
const Helper = require('../utilities/helper')
const Locator = require('../utilities/locator')

var missionLocation = {}
var missionPin
var userLocation = {}
var miniheroMap
var pins = []

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
    addSampleMarkers()
    addMissionMarker()
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
          window.location = '/mission/sample-' + div.getAttribute('data-marker_id')
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

function addSampleMarkers() {
  var missions = document.getElementById('missions')
  if (missions) {
    // Decide if sample markers need to be added.
    // TODO:
    // 1. Detect whether there are nearby missions in Node.js.
    // 2. Pass that information through to the HTML.
    // 3. Using front-end JS detect whether this information is present.
    // 4. Code up the if statement below.
    // 5. Pray for it to work.
    var nearbyMissions = false
    if (nearbyMissions) {
      // Nearby missions. Don't add sample markers.
      console.log('Nearby missions.')
      return
    } else {
      // No nearby missions. Add sample markers.
      console.log('No nearby missions.')
      // First, detect whether to add the sample markers around user's location or default location.
      var baseLatitude
      var baseLongitude
      if (userLocation.latitude) {
        // Location is shared. Set sample markers around user's location.
        console.log('user location known')
        baseLatitude = userLocation.latitude
        baseLongitude = userLocation.longitude
      } else {
        // Location not shared. Set sample markers around default location.
        console.log('user location unknown')
        baseLatitude = defaultLocation.latitude
        baseLongitude = defaultLocation.longitude
      }
      Array.prototype.forEach.call(window.sampleMissions, function(sampleMission, i) {
        var overlay = new CustomMarker(
          new google.maps.LatLng(baseLatitude + Number(sampleMission.location.latitudeOffset), baseLongitude + Number(sampleMission.location.longitudeOffset)),
          miniheroMap,
          {
            marker_id: i + 1,
            avatar: sampleMission.creator.imageUrl
          }
        )
        pins.push(overlay)
      })
    }
  }
}

function clearSampleMarkers() {
  while(pins[0]) {
    pins.pop().setMap(null)
  }
}

function addMissionMarker() {
  var mission = document.getElementById('mission')
  if (mission && !missionPin) {
    var overlay = new CustomMarker(
      new google.maps.LatLng(missionLocation.latitude, missionLocation.longitude),
      miniheroMap,
      {
        marker_id: mission.getAttribute('data-mission-id'),
        avatar: document.getElementById('creator-avatar').getAttribute('src')
      }
    )
    missionPin = overlay
  }
}

exports.setUserPosition = function(lat, lng) {
  userLocation.latitude = lat
  userLocation.longitude = lng
  new UserMarker(
    new google.maps.LatLng(lat, lng),
    miniheroMap
  )
  // Redraw the sample markers
  clearSampleMarkers()
  addSampleMarkers()
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
    missionLocation.latitude = Number(mission.getAttribute('data-location-latitude'))
    missionLocation.longitude = Number(mission.getAttribute('data-location-longitude'))
  }
  if (miniheroMap) {
    // console.log('about to update')
    if (document.getElementById('missions')) {
      if (Locator.getLocationCookie()) {
        // console.log('show user location')
        // Show missions around the user location.
        addSampleMarkers()
        panMapToCenter(null, userLocation.latitude, userLocation.longitude)
      } else {
        // console.log('show default location')
        // Show missions around the default location.
        panMapToCenter(null, defaultLocation.latitude, defaultLocation.longitude)
      }
    }
    if (document.getElementById('mission')) {
      // console.log('show mission location')
      // Show the mission.
      addMissionMarker()
      panMapToCenter(null, missionLocation.latitude, missionLocation.longitude)
    }
  } else {
    console.log('no miniheroMap defined')
  }
}
