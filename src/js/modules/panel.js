'use strict'

const Helper = require('../utilities/helper')

exports.init = function() {
  document.querySelector('.sidebar__preloader').addEventListener('transitionend', function (e) {
    Helper.addClass(e.target, '--hidden')
  }, false)
  Helper.addClass(document.querySelector('.sidebar'), '--ready')
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

function hideAllPanels() {
  var panels = document.querySelectorAll('.panel')
  Array.prototype.forEach.call(panels, function(el, i){
    Helper.removeClass(el, '--visible')
  })
}
exports.hideAllPanels = hideAllPanels
