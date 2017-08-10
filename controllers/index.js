const express = require('express')
const router = express.Router()
const mid = require('../middlewares')

router.use('/map', require('./map'))
router.use('/mission', require('./mission'))

// GET /
router.get('/', mid.redirectToHTTPS, function(req, res, next) {
  var maximumGallerySliders = 6
  return res.render('index', { showHeroIndex: Math.floor(Math.random() * (maximumGallerySliders - 0 + 1)) + 0 })
})

module.exports = router
