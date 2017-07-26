'use strict'

const gallery = require('./modules/gallery')

// Document ready handler
if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
  fn()
} else {
  document.addEventListener('DOMContentLoaded', init);
}

function init() {
  gallery.init()
}
