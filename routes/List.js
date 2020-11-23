const express = require('express')

const router = express.Router()
const listController = require('../controllers/List')

router.post('/', listController.createList)

router.get(':/id/list', listController.getAllList)

router.put('/:id', listController.updateList)

router.delete('/:id', listController.deleteList)


module.exports = router