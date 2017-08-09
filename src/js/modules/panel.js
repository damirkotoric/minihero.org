'use strict'

const Helper = require('../utilities/helper')

exports.init = function() {
  document.querySelector('[data-panel-close]').addEventListener('click', closePanel)
}

function closePanel(e) {
  e.preventDefault()
  var parentPanel = Helper.closest(e.currentTarget, '.panel')
  parentPanel.addEventListener('transitionend', function(event) {
    hidePanel(parentPanel.id)
  })
  Helper.addClass(parentPanel, '--hiding')
}

function showPanel(elementId) {
  Helper.addClass(document.getElementById(elementId), '--visible')
}
exports.showPanel = showPanel

function hidePanel(elementId) {
  Helper.removeClass(document.getElementById(elementId), '--visible')
}
exports.hidePanel = hidePanel
