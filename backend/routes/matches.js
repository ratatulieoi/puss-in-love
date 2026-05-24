const express = require('express');
const router = express.Router();
const matchModel = require('../model/matches');
const swipeModel = require('../model/swipes');
const verifyToken = require('../middleware/verifyToken');

const isMember = (match, userId) => {
    return match.user_a_id === userId || match.user_b_id === userId;
};

// GET /api/matches
router.get('/', verifyToken, async (req, res) => {
    try {
        const matches = await matchModel.getByUserId(req.user.userId);
        const liked = await swipeModel.getPendingLikesByUserId(req.user.userId);
        res.json({ data: matches, liked });
    } catch (error) {
        console.error('Get matches error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/matches/:id
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const match = await matchModel.getById(req.params.id);
        if (!match) return res.status(404).json({ error: 'Match not found' });
        if (!isMember(match, req.user.userId)) return res.status(403).json({ error: 'Not your match' });
        res.json({ data: match });
    } catch (error) {
        console.error('Get match error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/matches/:id/unmatch
router.put('/:id/unmatch', verifyToken, async (req, res) => {
    try {
        const match = await matchModel.getById(req.params.id);
        if (!match) return res.status(404).json({ error: 'Match not found' });
        if (!isMember(match, req.user.userId)) return res.status(403).json({ error: 'Not your match' });
        if (!match.is_active) return res.status(400).json({ error: 'Match already inactive' });

        await matchModel.unmatch(req.params.id);
        res.json({ message: 'Unmatched' });
    } catch (error) {
        console.error('Unmatch error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
