'use strict'

const panel = require('./panel')
const locator = require('../utilities/locator')
const Helper = require('../utilities/helper')

exports.init = function() {
  // https://stackoverflow.com/questions/7131909/facebook-callback-appends-to-return-url
  if (window.location.hash == '#_=_') {
    window.location.hash = ''
    history.pushState('', document.title, window.location.pathname)
  }

  var linkToHouseRules = document.getElementById('link-to-house-rules')
  if (linkToHouseRules) {
    linkToHouseRules.addEventListener('click', function(e) {
      e.preventDefault()
      panel.hidePanel('onboarding-synched')
      panel.showPanel('onboarding-house-rules')
    })
  }

  var linkToTerms = document.getElementById('link-to-terms')
  if (linkToTerms) {
    linkToTerms.addEventListener('click', function(e) {
      e.preventDefault()
      panel.hidePanel('onboarding-house-rules')
      panel.showPanel('onboarding-terms')
    })
  }

  var linkToAgree = document.getElementById('link-to-agree')
  if (linkToAgree) {
    linkToAgree.addEventListener('click', function(e) {
      e.preventDefault()
      if (!e.currentTarget.classList.contains('--loading')) {
        Helper.addClass(e.currentTarget, '--loading')
        agreeToTerms(e.currentTarget)
      }
    })
  }
}

function agreeToTerms(button) {
  var request = new XMLHttpRequest()
  request.open('POST', '/agree', true)
  request.onload = function() {
    Helper.removeClass(button, '--loading')
    if (request.status >= 200 && request.status < 400) {
      // Success!
      Helper.removeClass(document.body, 'onboarding')
      panel.hidePanel('onboarding-terms')
      panel.showPanel('onboarding-done')
    } else {
      // We reached our target server, but it returned an error
      console.log('server error')
    }
  }
  request.onerror = function() {
    // There was a connection error of some sort
    console.log('connection error')
  }
  request.send()
}

exports.start = function(step = 'onboarding-welcome') {
  Helper.addClass(document.body, 'onboarding')
  panel.showPanel(step)
}
