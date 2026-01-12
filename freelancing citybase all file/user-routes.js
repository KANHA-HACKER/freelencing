// routes/users.js - User Routes
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

// @route   GET /api/users
// @desc    Get all freelancers
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { city, skill, search } = req.query;
    
    let query = { userType: 'freelancer', isActive: true };
    
    // Filter by city
    if (city) {
      query.city = city;
    }
    
    // Filter by skill
    if (skill) {
      query.skill = skill;
    }
    
    // Search by name or skill
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { skill: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { fullName, phone, city, skill, experience, description } = req.body;

    // Update fields
    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (city) user.city = city;
    if (skill) user.skill = skill;
    if (experience) user.experience = experience;
    if (description) user.description = description;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Soft delete - just deactivate
    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Account deactivated successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting account',
      error: error.message
    });
  }
});

module.exports = router;