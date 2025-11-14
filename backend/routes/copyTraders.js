const express = require('express');
const router = express.Router();
const copyTradersController = require('../controllers/copyTradersController');

router.put('/:id', copyTradersController.updateCopyTrader);
router.post('/:id/reviews', copyTradersController.addReviewToTrader);


module.exports = router;
