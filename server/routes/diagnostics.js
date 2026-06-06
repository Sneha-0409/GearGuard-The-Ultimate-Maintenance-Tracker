const express = require('express');
const router = express.Router();
const diagnosticController = require('../controllers/diagnosticController');
const protect = require('../middleware/auth');
const { authorizeRoles } = require("../middleware/role");

router.use(protect);

router.get('/:category', diagnosticController.getTreeByCategory);
router.get('/:category/has-tree', diagnosticController.hasActiveTree);

// Only Admins can build trees
router.post('/:category', authorizeRoles('Admin'), diagnosticController.saveTree);

module.exports = router;
