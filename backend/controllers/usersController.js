const { dbRun, dbGet } = require('../database');
const { notifyDataChange } = require('../services/liveUpdates');

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const userUpdates = req.body;
    
    // Sanitize updates to prevent updating sensitive fields directly
    // Note: balance, invested, unclaimedProfit are allowed for admin operations
    const allowedUpdates = [
        'name', 'username', 'phone', 'country', 'address', 'password', 
        'kycDocuments', 'status', 'isFrozen', 'isBanned', 'notification',
        'isFeeExempt', 'balance', 'invested', 'unclaimedProfit'
    ];
    
    const updates = {};
    for (const key of allowedUpdates) {
        if (userUpdates.hasOwnProperty(key)) {
            updates[key] = userUpdates[key];
        }
    }

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No valid fields to update." });
    }
    
    // JSON stringify object fields
    ['kycDocuments', 'notification'].forEach(field => {
        if (updates[field]) {
            updates[field] = JSON.stringify(updates[field]);
        }
    });

    // Validate balance, invested, and unclaimedProfit to prevent negative values
    if (updates.hasOwnProperty('balance') && updates.balance < 0) {
        return res.status(400).json({ message: "Balance cannot be negative." });
    }
    if (updates.hasOwnProperty('invested') && updates.invested < 0) {
        return res.status(400).json({ message: "Invested amount cannot be negative." });
    }
    if (updates.hasOwnProperty('unclaimedProfit') && updates.unclaimedProfit < 0) {
        return res.status(400).json({ message: "Unclaimed profit cannot be negative." });
    }

    // If updating balance, invested, or unclaimedProfit, get current user to validate
    if (updates.hasOwnProperty('balance') || updates.hasOwnProperty('invested') || updates.hasOwnProperty('unclaimedProfit')) {
        const currentUser = await dbGet('SELECT balance, invested, unclaimedProfit FROM users WHERE id = ?', [id]);
        if (!currentUser) {
            return res.status(404).json({ message: "User not found." });
        }
        
        // Validate that adding to invested doesn't exceed balance
        if (updates.hasOwnProperty('invested') && updates.hasOwnProperty('balance')) {
            const newInvested = updates.invested;
            const newBalance = updates.balance;
            if (newInvested + newBalance > (currentUser.balance || 0) + (currentUser.invested || 0) + 1000) {
                // Allow some tolerance for admin adjustments, but log warning
                console.warn(`[updateUser] Large balance/invested adjustment for user ${id}`);
            }
        }
    }

    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);

    try {
        await dbRun(`UPDATE users SET ${setClause} WHERE id = ?`, [...values, id]);
        const updatedUser = await dbGet('SELECT * FROM users WHERE id = ?', [id]);
        notifyDataChange('user_updated', { userId: id });
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// --- Notifications ---

exports.addNotification = async (req, res) => {
    try {
        const { userId, type, messageKey, messageParams, link } = req.body;
        const newNotification = {
            id: `notif_${Date.now()}_${Math.random()}`,
            userId,
            timestamp: new Date().toISOString(),
            messageKey,
            messageParams: JSON.stringify(messageParams || {}),
            type,
            isRead: false,
            link: link || null
        };
        await dbRun(
            'INSERT INTO notifications (id, userId, timestamp, messageKey, messageParams, type, isRead, link) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            Object.values(newNotification)
        );
        notifyDataChange('notification_created', { userId, notificationId: newNotification.id });
        res.status(201).json(newNotification);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.markNotificationsAsRead = async (req, res) => {
    try {
        await dbRun('UPDATE notifications SET isRead = 1 WHERE userId = ?', [req.params.userId]);
        notifyDataChange('notifications_marked_read', { userId: req.params.userId });
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.clearReadNotifications = async (req, res) => {
    try {
        await dbRun('DELETE FROM notifications WHERE userId = ? AND isRead = 1', [req.params.userId]);
        notifyDataChange('notifications_cleared', { userId: req.params.userId });
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.markSingleNotificationAsRead = async (req, res) => {
    try {
        await dbRun('UPDATE notifications SET isRead = ? WHERE id = ?', [req.body.isRead, req.params.notificationId]);
        notifyDataChange('notification_updated', { notificationId: req.params.notificationId });
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteSingleNotification = async (req, res) => {
    try {
        await dbRun('DELETE FROM notifications WHERE id = ?', [req.params.notificationId]);
        notifyDataChange('notification_deleted', { notificationId: req.params.notificationId });
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
