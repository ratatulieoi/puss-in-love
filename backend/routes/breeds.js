const express = require('express');
const router = express.Router();
const breedModel = require('../model/breeds');
const verifyToken = require('../middleware/verifyToken');

// GET /api/breeds — list all breeds (for dropdown)
router.get('/', verifyToken, async (req, res) => {
    try {
        const breeds = await breedModel.getAll();
        res.json({ data: breeds });
    } catch (err) {
        console.error('Get breeds error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
