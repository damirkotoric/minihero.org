'use strict'

const Turbolinks = require('turbolinks')
const gallery = require('./modules/gallery')
const map = require('./modules/map')
const panel = require('./modules/panel')
const mission = require('./modules/mission')
const onboarding = require('./modules/onboarding')
const Locator = require('./utilities/locator')
const Helper = require('./utilities/helper')

// Document ready handler
if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
  fn()
} else {
  document.addEventListener('DOMContentLoaded', init)
}

function init() {
  Turbolinks.start()
  gallery.init()
}

// Need to expose initMap to global namespace for
// the Google Maps API. Since it's otherwise wrapped
// within the browserify namespace.
window.initMap = initMap
function initMap() {
  Locator.init()
  map.init()
  panel.init()
  mission.init()
  onboarding.init()
}
