'use strict'

const Helper = require('../utilities/helper')

exports.init = function() {
  const interval = 25000
  const gallery = document.querySelector('.gallery')
  if (gallery) {
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
}
