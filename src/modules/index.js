const express = require('express');
const userRoutes = require('./user/user.route');

const router = express.Router();

// Mount user routes
router.use('/users', userRoutes);


module.exports = router;
