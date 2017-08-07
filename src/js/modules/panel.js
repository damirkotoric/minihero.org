'use strict'

const Helper = require('../utilities/helper')

exports.init = function() {
  document.querySelector('[data-panel-close]').addEventListener('click', closePanel)
}

function closePanel(e) {
  e.preventDefault()
  var parentPanel = Helper.closest(e.currentTarget, '.panel')
  hidePanel(parentPanel.id)
}
