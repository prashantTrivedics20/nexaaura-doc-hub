const express = require('express');
const router = express.Router();
const AdminSettings = require('../models/AdminSettings');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// @route   GET /api/admin/settings
// @desc    Get all admin settings
// @access  Admin only
router.get('/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const settings = await AdminSettings.find().populate('updatedBy', 'username email');
    
    // Convert to key-value object for easier frontend consumption
    const settingsObject = {};
    settings.forEach(setting => {
      if (setting.key) { // Only include settings with valid keys
        settingsObject[setting.key] = {
          value: setting.value,
          description: setting.description,
          updatedBy: setting.updatedBy,
          updatedAt: setting.updatedAt
        };
      }
    });

    res.json({
      settings: settingsObject,
      count: Object.keys(settingsObject).length
    });
  } catch (error) {
    console.error('Get admin settings error:', error);
    res.status(500).json({ message: 'Failed to fetch admin settings' });
  }
});

// @route   POST /api/admin/settings
// @desc    Update admin setting
// @access  Admin only
router.post('/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { key, value, description } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({ message: 'Setting key and value are required' });
    }

    const setting = await AdminSettings.setSetting(
      key, 
      value, 
      description || '', 
      req.user._id
    );

    await setting.populate('updatedBy', 'username email');

    res.json({
      message: 'Setting updated successfully',
      setting: {
        key: setting.key,
        value: setting.value,
        description: setting.description,
        updatedBy: setting.updatedBy,
        updatedAt: setting.updatedAt
      }
    });
  } catch (error) {
    console.error('Update admin setting error:', error);
    res.status(500).json({ message: 'Failed to update setting' });
  }
});

// @route   GET /api/admin/settings/:key
// @desc    Get specific admin setting
// @access  Admin only
router.get('/settings/:key', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await AdminSettings.findOne({ key: key }).populate('updatedBy', 'username email');

    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }

    res.json({
      key: setting.key,
      value: setting.value,
      description: setting.description,
      updatedBy: setting.updatedBy,
      updatedAt: setting.updatedAt
    });
  } catch (error) {
    console.error('Get admin setting error:', error);
    res.status(500).json({ message: 'Failed to fetch setting' });
  }
});

// @route   DELETE /api/admin/settings/:key
// @desc    Delete admin setting
// @access  Admin only
router.delete('/settings/:key', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await AdminSettings.findOneAndDelete({ key: key });

    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }

    res.json({ message: 'Setting deleted successfully' });
  } catch (error) {
    console.error('Delete admin setting error:', error);
    res.status(500).json({ message: 'Failed to delete setting' });
  }
});

// @route   POST /api/admin/settings/bulk
// @desc    Update multiple admin settings
// @access  Admin only
router.post('/settings/bulk', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { settings } = req.body;

    if (!settings || !Array.isArray(settings)) {
      return res.status(400).json({ message: 'Settings array is required' });
    }

    const updatedSettings = [];

    for (const { key, value, description } of settings) {
      if (key && value !== undefined) {
        const setting = await AdminSettings.setSetting(
          key, 
          value, 
          description || '', 
          req.user._id
        );
        updatedSettings.push(setting);
      }
    }

    res.json({
      message: `${updatedSettings.length} settings updated successfully`,
      count: updatedSettings.length
    });
  } catch (error) {
    console.error('Bulk update admin settings error:', error);
    res.status(500).json({ message: 'Failed to update settings' });
  }
});

// @route   GET /api/admin/settings/public/free-access
// @desc    Get free access setting (public endpoint)
// @access  Public
router.get('/settings/public/free-access', async (req, res) => {
  try {
    const freeAccessEnabled = await AdminSettings.getSetting('free_document_access', false);
    
    res.json({
      freeAccessEnabled: freeAccessEnabled
    });
  } catch (error) {
    console.error('Get free access setting error:', error);
    res.status(500).json({ message: 'Failed to fetch free access setting' });
  }
});

module.exports = router;