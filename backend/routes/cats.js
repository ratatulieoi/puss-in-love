const express = require('express');
const router = express.Router();
const catModel = require('../model/cats');
const verifyToken = require('../middleware/verifyToken');

// GET /api/cats 
router.get('/', verifyToken, async (req, res) => {
    try {
        const cats = await catModel.getByUserId(req.user.userId);
        res.json({ data: cats });
    } catch (err) {
        console.error('Get cats error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/cats/browse 
router.get('/browse', verifyToken, async (req, res) => {
    try {
        const cats = await catModel.browse({
            userId: req.user.userId,
            search: req.query.search,
            breedId: req.query.breed_id,
            gender: req.query.gender,
            location: req.query.location
        });
        res.json({ data: cats });
    } catch (err) {
        console.error('Browse cats error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/cats 
router.post('/', verifyToken, async (req, res) => {
    try {
        const { breed_id, name, gender, birth_date, color, description } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Cat name is required' });
        }

        const catId = await catModel.create({
            user_id: req.user.userId,
            breed_id,
            name,
            gender: gender || 'unknown',
            birth_date,
            color,
            description
        });

        const cat = await catModel.getById(catId);
        res.status(201).json({ message: 'Cat added', data: cat });
    } catch (err) {
        console.error('Add cat error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/cats/:id 
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const cat = await catModel.getById(req.params.id);

        if (!cat) {
            return res.status(404).json({ error: 'Cat not found' });
        }

        // check ownership
        if (cat.user_id !== req.user.userId) {
            return res.status(403).json({ error: 'Not your cat' });
        }

        const { breed_id, name, gender, birth_date, color, description } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Cat name is required' });
        }

        await catModel.update(req.params.id, {
            breed_id,
            name,
            gender: gender || 'unknown',
            birth_date,
            color,
            description
        });

        const updated = await catModel.getById(req.params.id);
        res.json({ message: 'Cat updated', data: updated });
    } catch (err) {
        console.error('Update cat error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/cats/:id 
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const cat = await catModel.getById(req.params.id);

        if (!cat) {
            return res.status(404).json({ error: 'Cat not found' });
        }

        // check ownership
        if (cat.user_id !== req.user.userId) {
            return res.status(403).json({ error: 'Not your cat' });
        }

        await catModel.remove(req.params.id);
        res.json({ message: 'Cat deleted' });
    } catch (err) {
        console.error('Delete cat error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
