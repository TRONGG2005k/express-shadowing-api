const express = require('express');
const userRoutes = require('./user/user.route');
const vocabularyRoutes = require('./vocabulary/vocabulary.route');

const router = express.Router();

// Mount user routes
router.use('/users', userRoutes);

// Mount vocabulary routes
router.use('/vocabularies', vocabularyRoutes);

module.exports = router;
