const express = require('express')

const router = express.Router()
const boardController = require('../controllers/Board')
const authenticateJWT = require('../middlewares/index.')

router.get('/:id', authenticateJWT, boardController.readBoard)

router.get('/', boardController.getAllBoards)

router.post('/', authenticateJWT, boardController.createBoard)
// router.put(':/id', boardController.)
router.post("/:id/users/:userId", boardController.addUserToBoard)

module.exports = router
