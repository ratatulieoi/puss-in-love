const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const photoModel = require('../model/photos');
const catModel = require('../model/cats');
const verifyToken = require('../middleware/verifyToken');
const { photoUpload } = require('../middleware/upload');

const deleteFile = (fileUrl) => {
    if (!fileUrl) return;
    const filePath = path.join(__dirname, '..', fileUrl.replace('/uploads/', 'uploads/'));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};

// POST /api/cats/:id/photos
router.post('/cats/:id/photos', verifyToken, (req, res) => {
    photoUpload.single('photo')(req, res, async (err) => {
        if (err) return res.status(400).json({ error: err.message });

        try {
            const cat = await catModel.getById(req.params.id);
            if (!cat) return res.status(404).json({ error: 'Cat not found' });
            if (cat.user_id !== req.user.userId) return res.status(403).json({ error: 'Not your cat' });
            if (!req.file) return res.status(400).json({ error: 'Photo file is required' });

            const total = await photoModel.countByCatId(req.params.id);
            const photoUrl = `/uploads/cats/${req.file.filename}`;
            const photoId = await photoModel.create({
                cat_id: req.params.id,
                photo_url: photoUrl,
                is_primary: total === 0
            });

            res.status(201).json({ message: 'Photo uploaded', photoId, photo_url: photoUrl });
        } catch (error) {
            console.error('Upload photo error:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });
});

// GET /api/cats/:id/photos
router.get('/cats/:id/photos', verifyToken, async (req, res) => {
    try {
        const cat = await catModel.getById(req.params.id);
        if (!cat) return res.status(404).json({ error: 'Cat not found' });
        if (cat.user_id !== req.user.userId) return res.status(403).json({ error: 'Not your cat' });

        const photos = await photoModel.getByCatId(req.params.id);
        res.json({ data: photos });
    } catch (error) {
        console.error('Get photos error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/photos/:id
router.delete('/photos/:id', verifyToken, async (req, res) => {
    try {
        const photo = await photoModel.getById(req.params.id);
        if (!photo) return res.status(404).json({ error: 'Photo not found' });

        const cat = await catModel.getById(photo.cat_id);
        if (!cat) return res.status(404).json({ error: 'Cat not found' });
        if (cat.user_id !== req.user.userId) return res.status(403).json({ error: 'Not your cat' });

        deleteFile(photo.photo_url);
        await photoModel.remove(req.params.id);

        res.json({ message: 'Photo deleted' });
    } catch (error) {
        console.error('Delete photo error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/photos/:id/primary
router.put('/photos/:id/primary', verifyToken, async (req, res) => {
    try {
        const photo = await photoModel.getById(req.params.id);
        if (!photo) return res.status(404).json({ error: 'Photo not found' });

        const cat = await catModel.getById(photo.cat_id);
        if (!cat) return res.status(404).json({ error: 'Cat not found' });
        if (cat.user_id !== req.user.userId) return res.status(403).json({ error: 'Not your cat' });

        await photoModel.clearPrimary(photo.cat_id);
        await photoModel.setPrimary(req.params.id);

        res.json({ message: 'Primary photo updated' });
    } catch (error) {
        console.error('Set primary photo error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
