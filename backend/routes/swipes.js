const express = require('express');
const router = express.Router();
const swipeModel = require('../model/swipes');
const matchModel = require('../model/matches');
const catModel = require('../model/cats');
const verifyToken = require('../middleware/verifyToken');

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

        await swipeModel.create({
            user_id: req.user.userId,
            owner_cat_id,
            target_cat_id,
            direction
        });

        if (direction === 'pass') {
            return res.status(201).json({ message: 'Swipe saved', isMatch: false });
        }

        const mutualLike = await swipeModel.findMutualLike(owner_cat_id, target_cat_id);
        if (!mutualLike) {
            return res.status(201).json({ message: 'Swipe saved', isMatch: false });
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

        res.status(201).json({ message: "It's a Match!", isMatch: true, matchId: match.id });
    } catch (error) {
        console.error('Swipe error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
