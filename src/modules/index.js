const express = require('express');
const userRoutes = require('./user/user.route');
const assignmentRoutes = require('./assignment/assignment.route');

const router = express.Router();

// Mount user routes
router.use('/users', userRoutes);

// Mount assignment routes
router.use('/assignments', assignmentRoutes);

module.exports = router;
