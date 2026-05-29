const express = require('express');
const router = express.Router();
const breedModel = require('../model/breeds');
const verifyToken = require('../middleware/verifyToken');
const verifyAdmin = require('../middleware/admin');

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

// POST /api/breeds
router.post('/', verifyAdmin, async (req, res) => {
    try {
        const { name, description, origin } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Breed name is required' });
        }

        const breedId = await breedModel.create({ name, description, origin });
        const breed = await breedModel.getById(breedId);
        res.status(201).json({ message: 'Breed added', data: breed });
    } catch (err) {
        console.error('Add breed error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/breeds/:id
router.put('/:id', verifyAdmin, async (req, res) => {
    try {
        const { name, description, origin } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Breed name is required' });
        }

        const affected = await breedModel.update(req.params.id, { name, description, origin });
        if (affected === 0) {
            return res.status(404).json({ error: 'Breed not found' });
        }

        const breed = await breedModel.getById(req.params.id);
        res.json({ message: 'Breed updated', data: breed });
    } catch (err) {
        console.error('Update breed error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/breeds/:id
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        const affected = await breedModel.remove(req.params.id);
        if (affected === 0) {
            return res.status(404).json({ error: 'Breed not found' });
        }

        res.json({ message: 'Breed deleted' });
    } catch (err) {
        console.error('Delete breed error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
