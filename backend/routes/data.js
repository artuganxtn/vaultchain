const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');
const { registerClient } = require('../services/liveUpdates');

router.get('/', dataController.getAllData);
router.get('/stream', registerClient);

module.exports = router;
