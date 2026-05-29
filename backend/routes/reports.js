const express = require('express');
const router = express.Router();
const reportModel = require('../model/reports');
const catModel = require('../model/cats');
const verifyToken = require('../middleware/verifyToken');
const verifyAdmin = require('../middleware/admin');

// POST /api/reports
router.post('/', verifyToken, async (req, res) => {
    try {
        const { target_cat_id } = req.body;

        if (!target_cat_id) {
            return res.status(400).json({ error: 'target_cat_id is required' });
        }

        const cat = await catModel.getById(target_cat_id);
        if (!cat) {
            return res.status(404).json({ error: 'Cat not found' });
        }

        if (cat.user_id === req.user.userId) {
            return res.status(400).json({ error: 'Cannot report your own cat' });
        }

        const alreadyReported = await reportModel.hasReported(req.user.userId, target_cat_id);
        if (alreadyReported) {
            return res.status(409).json({ error: 'Already reported this cat' });
        }

        await reportModel.create(req.user.userId, target_cat_id);
        res.status(201).json({ message: 'Report submitted' });
    } catch (err) {
        console.error('Report error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/reports/cat/:catId — admin only
router.get('/cat/:catId', verifyAdmin, async (req, res) => {
    try {
        const reports = await reportModel.getByCatId(req.params.catId);
        res.json({ data: reports });
    } catch (err) {
        console.error('Get reports error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
