const express = require('express')
const router = express.Router()
const mid = require('../middlewares')

// GET /mission
router.get('/:id', function(req, res, next) {
  return res.render('map')
})

module.exports = router
