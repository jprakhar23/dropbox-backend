const express = require('express');

const uploadRoutes = require('./upload');
const listRoutes = require('./list');
const viewRoutes = require('./view');
const downloadRoutes = require('./download');
const deleteRoutes = require('./delete');

const router = express.Router();

router.use('/', uploadRoutes);

router.use('/', listRoutes);

router.use('/', viewRoutes);

router.use('/', downloadRoutes);

router.use('/', deleteRoutes);

module.exports = router;