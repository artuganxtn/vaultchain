const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

router.put('/:id', usersController.updateUser);

// Notification Routes
router.post('/notifications', usersController.addNotification);
router.post('/:userId/notifications/mark-read', usersController.markNotificationsAsRead);
router.delete('/:userId/notifications/clear-read', usersController.clearReadNotifications);
router.put('/notifications/:notificationId', usersController.markSingleNotificationAsRead);
router.delete('/notifications/:notificationId', usersController.deleteSingleNotification);


module.exports = router;
