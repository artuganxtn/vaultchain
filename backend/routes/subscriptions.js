const express = require('express');
const router = express.Router();
const subscriptionsController = require('../controllers/subscriptionsController');

router.post('/', subscriptionsController.addSubscription);
router.put('/:id', subscriptionsController.updateSubscription);

module.exports = router;
