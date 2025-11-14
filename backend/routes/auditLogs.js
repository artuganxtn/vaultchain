const express = require('express');
const router = express.Router();
const auditLogsController = require('../controllers/auditLogsController');

router.post('/', auditLogsController.addAuditLog);

module.exports = router;
