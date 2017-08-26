'use strict'

const panel = require('./panel')
const locator = require('../utilities/locator')
const Helper = require('../utilities/helper')

exports.init = function() {
  // A fix for https://stackoverflow.com/questions/7131909/facebook-callback-appends-to-return-url
  if (window.location.hash == '#_=_') {
    window.location.hash = ''
    history.pushState('', document.title, window.location.pathname)
  }

  if (window.location.hash == '#user-agreed-terms') {
    panel.showPanel('onboarding-done')
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

  var facebookLoginLink = document.getElementById('facebook-login-link')
  if (facebookLoginLink) {
    facebookLoginLink.addEventListener('click', function(e) {
      Helper.addClass(e.currentTarget, '--loading')
    })
  }
}

exports.start = function(step = 'onboarding-welcome') {
  if (step === 'onboarding-synched') {
    Helper.addClass(document.body, 'onboarding')
  }
  panel.showPanel(step)
}
