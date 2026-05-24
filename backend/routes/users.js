const express = require('express');
const router = express.Router();
const userModel = require('../model/users');
const verifyToken = require('../middleware/verifyToken');
const { avatarUpload } = require('../middleware/upload');

// GET /api/users/me
router.get('/me', verifyToken, async (req, res) => {
    try {
        const user = await userModel.getById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ data: user });
    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/users/me/avatar
router.put('/me/avatar', verifyToken, avatarUpload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Avatar file is required' });
        }

        const avatarUrl = `/uploads/avatars/${req.file.filename}`;
        const affected = await userModel.updateAvatar(req.user.userId, avatarUrl);

        if (affected === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const updated = await userModel.getById(req.user.userId);
        res.json({ message: 'Avatar updated', data: updated });
    } catch (err) {
        console.error('Update avatar error:', err);
        res.status(500).json({ error: err.message || 'Server error' });
    }
});

// PUT /api/users/me
router.put('/me', verifyToken, async (req, res) => {
    try {
        const { full_name, phone, location } = req.body;

        if (!full_name) {
            return res.status(400).json({ error: 'Full name is required' });
        }

        const affected = await userModel.update(req.user.userId, {
            full_name,
            phone: phone || null,
            location: location || null
        });

        if (affected === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const updated = await userModel.getById(req.user.userId);
        res.json({ message: 'Profile updated', data: updated });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
