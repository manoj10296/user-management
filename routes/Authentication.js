const express = require('express')
const createError = require('http-errors')
const User = require('../models/User')
const authController = require('../controllers/Auth')

const router = express.Router()


router.post('/register', authController.register)

router.post('/login', authController.login)

module.exports = router;