'use strict'

const Turbolinks = require('turbolinks')
const gallery = require('./modules/gallery')
const map = require('./modules/map')
const panel = require('./modules/panel')
const mission = require('./modules/mission')
const datepicker = require('./modules/datepicker')
const onboarding = require('./modules/onboarding')
const Locator = require('./utilities/locator')
const Helper = require('./utilities/helper')

// Document ready handler
if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
  init()
} else {
  document.addEventListener('DOMContentLoaded', init)
}

document.addEventListener('turbolinks:load', init)

function init() {
  Turbolinks.start()
  gallery.init()
  Locator.init()
  panel.init()
  mission.init()
  datepicker.init()
  map.updateIfNeeded()
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
  datepicker.init()
  onboarding.init()
}
