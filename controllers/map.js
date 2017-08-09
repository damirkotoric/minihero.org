const express = require('express')
const router = express.Router()
const mid = require('../middlewares')

// GET /map
router.get('/', mid.redirectToHTTPS, function(req, res, next) {
  return res.render('map')
})

module.exports = router
