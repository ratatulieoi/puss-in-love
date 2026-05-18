const express = require('express');
const router = express.Router();
const matchModel = require('../model/matches');
const messageModel = require('../model/messages');
const verifyToken = require('../middleware/verifyToken');

const isMember = (match, userId) => {
    return match.user_a_id === userId || match.user_b_id === userId;
};

const checkActiveMatch = async (matchId, userId) => {
    const match = await matchModel.getById(matchId);
    if (!match) return { error: 'Match not found', status: 404 };
    if (!isMember(match, userId)) return { error: 'Not your match', status: 403 };
    if (!match.is_active) return { error: 'Match is inactive', status: 403 };
    return { match };
};

// GET /api/messages/:matchId
router.get('/:matchId', verifyToken, async (req, res) => {
    try {
        const check = await checkActiveMatch(req.params.matchId, req.user.userId);
        if (check.error) return res.status(check.status).json({ error: check.error });

        const messages = await messageModel.getByMatchId(req.params.matchId);
        res.json({ data: messages });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/messages/:matchId
router.post('/:matchId', verifyToken, async (req, res) => {
    try {
        const check = await checkActiveMatch(req.params.matchId, req.user.userId);
        if (check.error) return res.status(check.status).json({ error: check.error });

        const { content } = req.body;
        if (!content || !content.trim()) {
            return res.status(400).json({ error: 'Message content is required' });
        }

        const messageId = await messageModel.create({
            match_id: req.params.matchId,
            sender_id: req.user.userId,
            content: content.trim()
        });

        const message = await messageModel.getById(messageId);
        res.status(201).json({ message: 'Message sent', data: message });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/messages/:matchId/read
router.put('/:matchId/read', verifyToken, async (req, res) => {
    try {
        const check = await checkActiveMatch(req.params.matchId, req.user.userId);
        if (check.error) return res.status(check.status).json({ error: check.error });

        await messageModel.markRead(req.params.matchId, req.user.userId);
        res.json({ message: 'Messages marked as read' });
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
