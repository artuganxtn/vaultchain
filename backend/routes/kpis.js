const express = require('express');
const router = express.Router();
const kpisController = require('../controllers/kpisController');

router.get('/', kpisController.getAdminKpis);

module.exports = router;
