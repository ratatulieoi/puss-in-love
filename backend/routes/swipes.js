const express = require('express');
const router = express.Router();
const swipeModel = require('../model/swipes');
const matchModel = require('../model/matches');
const catModel = require('../model/cats');
const verifyToken = require('../middleware/verifyToken');

// GET /api/swipes/browse?owner_cat_id=1 — get swipe candidates
router.get('/browse', verifyToken, async (req, res) => {
    try {
        const { owner_cat_id } = req.query;

        if (!owner_cat_id) {
            return res.status(400).json({ error: 'owner_cat_id is required' });
        }

        const ownerCat = await catModel.getById(owner_cat_id);
        if (!ownerCat) {
            return res.status(404).json({ error: 'Owner cat not found' });
        }

        if (ownerCat.user_id !== req.user.userId) {
            return res.status(403).json({ error: 'Owner cat is not yours' });
        }

        const cats = await catModel.getSwipeCandidates(req.user.userId, owner_cat_id);
        res.json({ data: cats });
    } catch (error) {
        console.error('Get swipe candidates error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/swipes/owner/:ownerCatId — clear swipe history for selected cat
router.delete('/owner/:ownerCatId', verifyToken, async (req, res) => {
    try {
        const ownerCat = await catModel.getById(req.params.ownerCatId);
        if (!ownerCat) {
            return res.status(404).json({ error: 'Owner cat not found' });
        }

        if (ownerCat.user_id !== req.user.userId) {
            return res.status(403).json({ error: 'Owner cat is not yours' });
        }

        await swipeModel.clearPassesByOwnerCatId(req.params.ownerCatId);
        res.json({ message: 'Swipe history cleared' });
    } catch (error) {
        console.error('Clear swipe history error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/swipes/:id/unlike — undo pending like swipe only
router.delete('/:id/unlike', verifyToken, async (req, res) => {
    try {
        const swipe = await swipeModel.getById(req.params.id);
        if (!swipe) {
            return res.status(404).json({ error: 'Swipe not found' });
        }

        if (swipe.user_id !== req.user.userId) {
            return res.status(403).json({ error: 'Not your swipe' });
        }

        if (swipe.direction !== 'like') {
            return res.status(400).json({ error: 'Only likes can be unliked here' });
        }

        const match = await matchModel.getByCats(swipe.owner_cat_id, swipe.target_cat_id);
        if (match && match.is_active) {
            return res.status(400).json({ error: 'Cannot unlike after a match is created' });
        }

        await swipeModel.remove(req.params.id);
        res.json({ message: 'Like removed' });
    } catch (error) {
        console.error('Unlike swipe error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/swipes/:id — undo pass swipe only
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const swipe = await swipeModel.getById(req.params.id);
        if (!swipe) {
            return res.status(404).json({ error: 'Swipe not found' });
        }

        if (swipe.user_id !== req.user.userId) {
            return res.status(403).json({ error: 'Not your swipe' });
        }

        if (swipe.direction !== 'pass') {
            return res.status(400).json({ error: 'Only pass swipes can be undone' });
        }

        await swipeModel.remove(req.params.id);
        res.json({ message: 'Pass undone' });
    } catch (error) {
        console.error('Undo swipe error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/swipes
router.post('/', verifyToken, async (req, res) => {
    try {
        const { owner_cat_id, target_cat_id, direction } = req.body;

        if (!owner_cat_id || !target_cat_id || !direction) {
            return res.status(400).json({ error: 'owner_cat_id, target_cat_id, and direction are required' });
        }

        if (!['like', 'pass'].includes(direction)) {
            return res.status(400).json({ error: 'Direction must be like or pass' });
        }

        const ownerCat = await catModel.getById(owner_cat_id);
        const targetCat = await catModel.getById(target_cat_id);

        if (!ownerCat || !targetCat) {
            return res.status(404).json({ error: 'Cat not found' });
        }

        if (ownerCat.user_id !== req.user.userId) {
            return res.status(403).json({ error: 'Owner cat is not yours' });
        }

        if (targetCat.user_id === req.user.userId) {
            return res.status(400).json({ error: 'Cannot swipe your own cat' });
        }

        const existing = await swipeModel.getByPair(req.user.userId, owner_cat_id, target_cat_id);
        if (existing) {
            return res.status(409).json({ error: 'You already swiped this cat' });
        }

        const swipeId = await swipeModel.create({
            user_id: req.user.userId,
            owner_cat_id,
            target_cat_id,
            direction
        });

        if (direction === 'pass') {
            return res.status(201).json({ message: 'Swipe saved', isMatch: false, swipeId });
        }

        const mutualLike = await swipeModel.findMutualLike(owner_cat_id, target_cat_id);
        if (!mutualLike) {
            return res.status(201).json({ message: 'Swipe saved', isMatch: false, swipeId });
        }

        let match = await matchModel.getByCats(owner_cat_id, target_cat_id);
        if (!match) {
            const matchId = await matchModel.create({
                user_a_id: req.user.userId,
                user_b_id: targetCat.user_id,
                cat_a_id: owner_cat_id,
                cat_b_id: target_cat_id
            });
            match = { id: matchId };
        }

        res.status(201).json({ message: "It's a Match!", isMatch: true, matchId: match.id, swipeId });
    } catch (error) {
        console.error('Swipe error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
