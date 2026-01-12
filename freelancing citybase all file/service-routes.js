// routes/services.js - Service Routes
const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const { authMiddleware } = require('../middleware/auth');

// @route   GET /api/services
// @desc    Get all services with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, city, minPrice, maxPrice, search, sort } = req.query;
    
    let query = { isActive: true };
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Filter by city (populate user and filter)
    let services = await Service.find(query).populate('user');
    
    if (city) {
      services = services.filter(service => service.user && service.user.city === city);
    }
    
    // Filter by price range
    if (minPrice) {
      services = services.filter(service => service.price >= Number(minPrice));
    }
    if (maxPrice) {
      services = services.filter(service => service.price <= Number(maxPrice));
    }
    
    // Search by title or description
    if (search) {
      const searchLower = search.toLowerCase();
      services = services.filter(service => 
        service.title.toLowerCase().includes(searchLower) ||
        service.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort
    if (sort === 'price_low') {
      services.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_high') {
      services.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      services.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'newest') {
      services.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.status(200).json({
      success: true,
      count: services.length,
      services
    });

  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching services',
      error: error.message
    });
  }
});

// @route   GET /api/services/:id
// @desc    Get single service by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('user');
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Increment views
    service.views += 1;
    await service.save();

    res.status(200).json({
      success: true,
      service
    });

  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching service',
      error: error.message
    });
  }
});

// @route   POST /api/services
// @desc    Create new service
// @access  Private (Freelancers only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, category, description, price, deliveryTime, features } = req.body;

    // Check if user is a freelancer
    if (req.user.userType !== 'freelancer') {
      return res.status(403).json({
        success: false,
        message: 'Only freelancers can create services'
      });
    }

    // Validation
    if (!title || !category || !description || !price || !deliveryTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Parse features if it's a string
    let featuresArray = features;
    if (typeof features === 'string') {
      featuresArray = features.split('\n').filter(f => f.trim());
    }

    // Create service
    const service = new Service({
      userId: req.user.userId,
      title,
      category,
      description,
      price,
      deliveryTime,
      features: featuresArray || []
    });

    await service.save();

    const populatedService = await Service.findById(service._id).populate('user');

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service: populatedService
    });

  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating service',
      error: error.message
    });
  }
});

// @route   PUT /api/services/:id
// @desc    Update service
// @access  Private (Owner only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check ownership
    if (service.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this service'
      });
    }

    const { title, category, description, price, deliveryTime, features } = req.body;

    // Parse features if it's a string
    let featuresArray = features;
    if (typeof features === 'string') {
      featuresArray = features.split('\n').filter(f => f.trim());
    }

    // Update fields
    if (title) service.title = title;
    if (category) service.category = category;
    if (description) service.description = description;
    if (price !== undefined) service.price = price;
    if (deliveryTime) service.deliveryTime = deliveryTime;
    if (featuresArray) service.features = featuresArray;

    await service.save();

    const updatedService = await Service.findById(service._id).populate('user');

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      service: updatedService
    });

  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating service',
      error: error.message
    });
  }
});

// @route   DELETE /api/services/:id
// @desc    Delete service
// @access  Private (Owner only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check ownership
    if (service.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this service'
      });
    }

    await service.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully'
    });

  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting service',
      error: error.message
    });
  }
});

// @route   GET /api/services/user/:userId
// @desc    Get all services by user ID
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const services = await Service.find({ 
      userId: req.params.userId,
      isActive: true 
    }).populate('user');

    res.status(200).json({
      success: true,
      count: services.length,
      services
    });

  } catch (error) {
    console.error('Get user services error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user services',
      error: error.message
    });
  }
});

module.exports = router;