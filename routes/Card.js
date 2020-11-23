const e = require('express')
const express = require('express')

const router = express.Router()

const cardController = require('../controllers/Card')

router.post('/', cardController.createCard)

router.get('/:id', cardController.getCard)

router.put('/:id', cardController.updateCard)

router.post('/:id/users/:userId', cardController.addMemberToCard)

router.delete('/:id/users/:userId', cardController.removeMemberFromCard)

router.delete('/:id', cardController.deleteCard)

module.exports = router
