'use strict'

const express = require('express')
const { asyncHandler} = require('../../helpers/asyncHandler')
const templateController = require('../../controllers/template.controller')
const router = express.Router()


router.post('/new_template', asyncHandler(templateController.newTem))



module.exports = router