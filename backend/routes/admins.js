const express = require('express');
const router = express.Router();
const adminsController = require('../controllers/adminsController');

router.post('/', adminsController.addAdminUser);

module.exports = router;
