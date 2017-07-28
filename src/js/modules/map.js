'use strict'

const Helper = require('../utilities/helper')

exports.init = function() {
  var map = document.querySelector('.map')
  if (map) {
    // Create the map with no initial style specified.
    // It therefore has default styling.
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 52.3628317, lng: 4.908374},
      zoom: 13,
      mapTypeControl: false,
      maxZoom: 15,
      streetViewControl: false,
      zoomControl: false,
      backgroundColor: '#444444'
    })
    map.setOptions({styles: styles['minihero']});
  }
}

var styles = {
  default: null,
  minihero:
  // [
  //   {
  //     elementType: 'geometry',
  //     stylers: [{color: '#f5f5f5'}]
  //   },
  //   {
  //     elementType: 'labels.icon',
  //     stylers: [{visibility: 'off'}]
  //   },
  //   {
  //     elementType: 'labels.text.fill',
  //     stylers: [{color: '#616161'}]
  //   },
  //   {
  //     elementType: 'labels.text.stroke',
  //     stylers: [{color: '#f5f5f5'}]
  //   },
  //   {
  //     featureType: 'administrative.land_parcel',
  //     elementType: 'labels.text.fill',
  //     stylers: [{color: '#bdbdbd'}]
  //   },
  //   {
  //     featureType: 'poi',
  //     elementType: 'geometry',
  //     stylers: [{color: '#eeeeee'}]
  //   },
  //   {
  //     featureType: 'poi',
  //     elementType: 'labels.text.fill',
  //     stylers: [{color: '#757575'}]
  //   },
  //   {
  //     featureType: 'poi.park',
  //     elementType: 'geometry',
  //     stylers: [{color: '#e5e5e5'}]
  //   },
  //   {
  //     featureType: 'poi.park',
  //     elementType: 'labels.text.fill',
  //     stylers: [{color: '#9e9e9e'}]
  //   },
  //   {
  //     featureType: 'road',
  //     elementType: 'geometry',
  //     stylers: [{color: '#ffffff'}]
  //   },
  //   {
  //     featureType: 'road.arterial',
  //     elementType: 'labels.text.fill',
  //     stylers: [{color: '#757575'}]
  //   },
  //   {
  //     featureType: 'road.highway',
  //     elementType: 'geometry',
  //     stylers: [{color: '#dadada'}]
  //   },
  //   {
  //     featureType: 'road.highway',
  //     elementType: 'labels.text.fill',
  //     stylers: [{color: '#616161'}]
  //   },
  //   {
  //     featureType: 'road.local',
  //     elementType: 'labels.text.fill',
  //     stylers: [{color: '#9e9e9e'}]
  //   },
  //   {
  //     featureType: 'transit.line',
  //     elementType: 'geometry',
  //     stylers: [{color: '#e5e5e5'}]
  //   },
  //   {
  //     featureType: 'transit.station',
  //     elementType: 'geometry',
  //     stylers: [{color: '#eeeeee'}]
  //   },
  //   {
  //     featureType: 'water',
  //     elementType: 'geometry',
  //     stylers: [{color: '#c9c9c9'}]
  //   },
  //   {
  //     featureType: 'water',
  //     elementType: 'labels.text.fill',
  //     stylers: [{color: '#9e9e9e'}]
  //   }
  // ]
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
                "visibility": "off"
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
};
