(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./modules/gallery":2}],2:[function(require,module,exports){
'use strict'

const Helper = require('../utilities/helper')

exports.init = function() {
  const interval = 25000
  const gallery = document.querySelector('.gallery')
  const slides = gallery.querySelectorAll('li')
  const numberOfSlides = slides.length
  window.setInterval(function () {
    let activeSlide = gallery.querySelector('.--active')
    let currentSlideIndex = Array.prototype.indexOf.call(gallery.querySelectorAll('li'), activeSlide)
    Helper.removeClass(activeSlide, '--active')
    if (currentSlideIndex < numberOfSlides - 1) {
      // Show next slide.
      Helper.addClass(activeSlide.nextElementSibling, '--active')
    } else {
      // End reached. Start from first slide.
      Helper.addClass(gallery.firstChild, '--active')
    }
  }, interval)
}

},{"../utilities/helper":3}],3:[function(require,module,exports){
'use strict'

exports.removeClass = function(el, className) {
  if (el.classList)
    el.classList.remove(className);
  else
    el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
}

exports.addClass = function(el, className) {
  if (el.classList)
    el.classList.add(className);
  else
    el.className += ' ' + className;
}

},{}]},{},[1])