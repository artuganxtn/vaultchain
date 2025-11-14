const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/transactionsController');

router.post('/', transactionsController.addTransaction);
router.put('/:id', transactionsController.updateTransaction);

module.exports = router;
