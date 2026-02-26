const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { isAdmin } = require('../middleware/auth');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Get all notifications for the current user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get notifications where user is recipient and hasn't deleted it and hasn't read it
    const notifications = await Notification.find({
      $and: [
        {
          $or: [
            { recipients: 'all' },
            { recipients: 'specific', specificUsers: userId }
          ]
        },
        { deletedBy: { $ne: userId } },
        { 'readBy.userId': { $ne: userId } } // Only unread notifications
      ]
    })
    .sort({ createdAt: -1 })
    .limit(3) // Max 3 notifications
    .populate('createdBy', 'username')
    .lean();

    // Add read status for each notification (all will be unread due to filter)
    const notificationsWithStatus = notifications.map(notif => {
      return {
        ...notif,
        read: false,
        readAt: null
      };
    });

    res.json(notificationsWithStatus);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// Get unread count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const notifications = await Notification.find({
      $and: [
        {
          $or: [
            { recipients: 'all' },
            { recipients: 'specific', specificUsers: userId }
          ]
        },
        { deletedBy: { $ne: userId } },
        { 'readBy.userId': { $ne: userId } }
      ]
    }).countDocuments();

    res.json({ count: notifications });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Failed to fetch unread count' });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;

    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if already read
    const alreadyRead = notification.readBy.some(r => r.userId.toString() === userId.toString());
    
    if (!alreadyRead) {
      notification.readBy.push({ userId, readAt: new Date() });
      await notification.save();
    }

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
});

// Mark notification as unread
router.put('/:id/unread', auth, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;

    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Remove from readBy array
    notification.readBy = notification.readBy.filter(r => r.userId.toString() !== userId.toString());
    await notification.save();

    res.json({ message: 'Notification marked as unread' });
  } catch (error) {
    console.error('Error marking notification as unread:', error);
    res.status(500).json({ message: 'Failed to mark notification as unread' });
  }
});

// Mark all as read
router.put('/mark-all-read', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all unread notifications for this user
    const notifications = await Notification.find({
      $and: [
        {
          $or: [
            { recipients: 'all' },
            { recipients: 'specific', specificUsers: userId }
          ]
        },
        { deletedBy: { $ne: userId } },
        { 'readBy.userId': { $ne: userId } }
      ]
    });

    // Mark each as read
    const readTime = new Date();
    for (let notif of notifications) {
      notif.readBy.push({ userId, readAt: readTime });
      await notif.save();
    }

    res.json({ message: 'All notifications marked as read', count: notifications.length });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ message: 'Failed to mark all as read' });
  }
});

// Delete notification (soft delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;

    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Add user to deletedBy array
    if (!notification.deletedBy.includes(userId)) {
      notification.deletedBy.push(userId);
      await notification.save();
    }

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Failed to delete notification' });
  }
});

// Delete all notifications for current user
router.delete('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all notifications for this user
    const notifications = await Notification.find({
      $and: [
        {
          $or: [
            { recipients: 'all' },
            { recipients: 'specific', specificUsers: userId }
          ]
        },
        { deletedBy: { $ne: userId } }
      ]
    });

    // Add user to deletedBy for each
    for (let notif of notifications) {
      if (!notif.deletedBy.includes(userId)) {
        notif.deletedBy.push(userId);
        await notif.save();
      }
    }

    res.json({ message: 'All notifications deleted', count: notifications.length });
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    res.status(500).json({ message: 'Failed to delete all notifications' });
  }
});

// ===== ADMIN ROUTES =====

// Create notification (admin only)
router.post('/admin/create', auth, isAdmin, async (req, res) => {
  try {
    const { title, description, type, recipients, specificUsers, iconColor, iconBg } = req.body;

    console.log('[Admin] Creating notification:', { title, description, type, recipients, createdBy: req.user.id });

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const notification = new Notification({
      title,
      description,
      type: type || 'system',
      recipients: recipients || 'all',
      specificUsers: specificUsers || [],
      createdBy: req.user.id,
      iconColor: iconColor || 'text-teal-400',
      iconBg: iconBg || 'bg-teal-500/20'
    });

    await notification.save();

    console.log('[Admin] Notification created successfully:', notification._id);

    res.status(201).json({ 
      message: 'Notification created successfully', 
      notification 
    });
  } catch (error) {
    console.error('[Admin] Error creating notification:', error);
    res.status(500).json({ message: 'Failed to create notification', error: error.message });
  }
});

// Get all notifications (admin view)
router.get('/admin/all', auth, isAdmin, async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'username')
      .lean();

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching all notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// Clear all notifications from all users (admin only) - MUST be before /admin/:id
router.delete('/admin/clear-all', auth, isAdmin, async (req, res) => {
  try {
    const result = await Notification.deleteMany({});
    
    console.log('[Admin] Cleared all notifications:', result.deletedCount);
    
    res.json({ 
      message: 'All notifications cleared from all users', 
      count: result.deletedCount 
    });
  } catch (error) {
    console.error('[Admin] Error clearing all notifications:', error);
    res.status(500).json({ message: 'Failed to clear all notifications' });
  }
});

// Delete notification permanently (admin only)
router.delete('/admin/:id', auth, isAdmin, async (req, res) => {
  try {
    const notificationId = req.params.id;
    
    await Notification.findByIdAndDelete(notificationId);
    
    res.json({ message: 'Notification permanently deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Failed to delete notification' });
  }
});

// Get all users (for admin to select recipients)
router.get('/admin/users', auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select('_id username email')
      .sort({ username: 1 });
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

module.exports = router;
