const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const { authenticateAdmin } = require('../middleware/auth');

// Public routes
router.get('/', pageController.getAllPages);
router.get('/:slug', pageController.getPageBySlug);

// Admin routes
router.post('/', authenticateAdmin, pageController.createPage);
router.put('/:slug', authenticateAdmin, pageController.updatePage);
router.patch('/:slug/sections/:sectionId', authenticateAdmin, pageController.updateSection);
router.delete('/:slug', authenticateAdmin, pageController.deletePage);

module.exports = router;
