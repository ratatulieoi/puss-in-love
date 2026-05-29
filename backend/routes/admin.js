const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../model/users');
const adminModel = require('../model/admin');
const verifyAdmin = require('../middleware/admin');

// POST /api/admin/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await userModel.getByEmail(email);
        if (!user || user.role !== 'admin') {
            return res.status(401).json({ error: 'Invalid admin credentials' });
        }

        if (!user.is_active) {
            return res.status(403).json({ error: 'Admin account is suspended' });
        }

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ error: 'Invalid admin credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            message: 'Admin login successful',
            token,
            admin: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Admin login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/admin/users
router.get('/users', verifyAdmin, async (req, res) => {
    try {
        const users = await adminModel.getUsers();
        res.json({ data: users });
    } catch (err) {
        console.error('Admin get users error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/admin/users/:id/status
router.put('/users/:id/status', verifyAdmin, async (req, res) => {
    try {
        const { is_active } = req.body;

        if (typeof is_active !== 'boolean') {
            return res.status(400).json({ error: 'is_active must be true or false' });
        }

        const affected = await adminModel.updateUserStatus(req.params.id, is_active);
        if (affected === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = await userModel.getById(req.params.id);
        res.json({ message: 'User status updated', data: user });
    } catch (err) {
        console.error('Admin update user status error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/admin/cats
router.get('/cats', verifyAdmin, async (req, res) => {
    try {
        const cats = await adminModel.getCats();
        res.json({ data: cats });
    } catch (err) {
        console.error('Admin get cats error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/admin/cats/:id/status
router.put('/cats/:id/status', verifyAdmin, async (req, res) => {
    try {
        const { is_active } = req.body;

        if (typeof is_active !== 'boolean') {
            return res.status(400).json({ error: 'is_active must be true or false' });
        }

        const affected = await adminModel.updateCatStatus(req.params.id, is_active);
        if (affected === 0) {
            return res.status(404).json({ error: 'Cat not found' });
        }

        const cats = await adminModel.getCats();
        const cat = cats.find(item => item.id === Number(req.params.id));
        res.json({ message: 'Cat status updated', data: cat });
    } catch (err) {
        console.error('Admin update cat status error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/admin/statistics
router.get('/statistics', verifyAdmin, async (req, res) => {
    try {
        const statistics = await adminModel.getStatistics();
        res.json({ data: statistics });
    } catch (err) {
        console.error('Admin statistics error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
