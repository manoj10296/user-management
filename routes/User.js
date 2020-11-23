const express = require('express')

const router = express.Router()

const userController = require('../controllers/User')
const authenticateJWT = require('../middlewares/index.')


router.get('/', userController.getAllUsers)

router.get('/boards', authenticateJWT, userController.getUserBoards)

module.exports = router