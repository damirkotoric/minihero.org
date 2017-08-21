'use strict'

const Helper = require('../utilities/helper')

exports.init = function() {
  if (document.getElementById('sidebar')) {
    if (document.querySelector('[data-panel-close]')) {
      document.querySelector('[data-panel-close]').addEventListener('click', closePanel)
    }
  }
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

function hidePanelsContaining(keyword) {
  var panels = document.querySelectorAll('.panel')
  Array.prototype.forEach.call(panels, function(el, i) {
    if (el.getAttribute('id').includes(keyword)) {
      Helper.removeClass(el, '--visible')
    }
  })
}
exports.hidePanelsContaining = hidePanelsContaining

function hideVisiblePanels() {
  var panels = document.querySelectorAll('.panel.--visible')
  Array.prototype.forEach.call(panels, function(el, i) {
    Helper.removeClass(el, '--visible')
  })
}
exports.hideVisiblePanels = hideVisiblePanels
