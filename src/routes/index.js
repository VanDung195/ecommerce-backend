'use strict'

const express = require('express')
const router = express.Router()

router.use('/api/template', require('./template'))
router.use('/api/email', require('./email'))

module.exports = router
