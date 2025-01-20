'use strict'

const express = require('express')
const router = express.Router()

router.use('/api/template', require('./template'))
router.use('/api/email', require('./email'))
router.use('/api/user', require('./user'))
router.use('/api', require('./access'))

module.exports = router
