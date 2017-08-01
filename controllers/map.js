const express = require('express')
const router = express.Router()

// GET /map
router.get('/', function(req, res, next) {
  return res.render('map')
})

module.exports = router
