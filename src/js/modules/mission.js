'use strict'

const panel = require('../modules/panel')
const Helper = require('../utilities/helper')

exports.init = function() {
  var missionOpenLinks = document.querySelectorAll('a.mission__header')
  Array.prototype.forEach.call(missionOpenLinks, function(el, i) {
    el.addEventListener('click', openMission)
  })
  var missionCloseLinks = document.querySelectorAll('a[data-mission-close]')
  Array.prototype.forEach.call(missionCloseLinks, function(el, i) {
    el.addEventListener('click', closeMission)
  })
  var missionJoinLinks = document.querySelectorAll('a[data-mission-join]')
  Array.prototype.forEach.call(missionJoinLinks, function(el, i) {
    el.addEventListener('click', joinMission)
  })
  document.querySelector('a[data-mission-create]').addEventListener('click', showMissionCreationForm)
  document.querySelector('a[data-mission-create-send]').addEventListener('click', createMission)
}

function openMission(e) {
  e.preventDefault()
  panel.hidePanel('missions')
  var href = e.currentTarget.getAttribute('href')
  var missionIndex = Number(href.substring(href.lastIndexOf('/') + 1))
  panel.showPanel('mission' + missionIndex)
}

function closeMission(e) {
  e.preventDefault()
  panel.hideAllPanels()
  panel.showPanel('missions')
}

function joinMission(e) {
  e.preventDefault()
  // Check authentication

  // Mark user as joined

  Helper.addClass(e.currentTarget.closest('.mission'), '--joining')
}

function showMissionCreationForm(e) {
  e.preventDefault()
  panel.hideAllPanels()
  panel.showPanel('mission-new')
}

function createMission(e) {
  e.preventDefault()
}
