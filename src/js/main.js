'use strict'

const gallery = require('./modules/gallery')
const map = require('./modules/map')

// Document ready handler
if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
  fn()
} else {
  document.addEventListener('DOMContentLoaded', init)
}

function init() {
  gallery.init()
}

// Need to expose initMap to global namespace for
// the Google Maps API. Since it's otherwise wrapped
// within the browserify namespace.
window.initMap = initMap
function initMap() {
  map.init()
}
