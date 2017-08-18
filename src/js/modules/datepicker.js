'use strict'

const Pikaday = require('pikaday')

// This customises the datepicker library found at https://github.com/dbushell/Pikaday

exports.init = function() {
  if (document.documentElement.classList.contains('no-touchevents')) {
    // Show Pikaday only on mouse-based devices
    var missionDate = document.getElementById('mission_date')
    // If missionDate is on the page and it's not already instantiated.
    if (missionDate && missionDate.getAttribute('type') != 'text') {
      missionDate.setAttribute('type', 'text')
      var today = new Date()
      new Pikaday({
        field: missionDate,
        minDate: today,
        maxDate: addMonths(today, 6),
        firstDay: 1
      })
    }
  }
}

function addMonths (date, count) {
  if (date && count) {
    var m, d = (date = new Date(+date)).getDate()

    date.setMonth(date.getMonth() + count, 1)
    m = date.getMonth()
    date.setDate(d)
    if (date.getMonth() !== m) date.setDate(0)
  }
  return date
}
