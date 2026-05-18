const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const vaccinationModel = require('../model/vaccinations');
const catModel = require('../model/cats');
const verifyToken = require('../middleware/verifyToken');
const { certificateUpload } = require('../middleware/upload');

const deleteFile = (fileUrl) => {
    if (!fileUrl) return;
    const filePath = path.join(__dirname, '..', fileUrl.replace('/uploads/', 'uploads/'));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};

// POST /api/cats/:id/vaccinations
router.post('/cats/:id/vaccinations', verifyToken, (req, res) => {
    certificateUpload.single('certificate')(req, res, async (err) => {
        if (err) return res.status(400).json({ error: err.message });

        try {
            const cat = await catModel.getById(req.params.id);
            if (!cat) return res.status(404).json({ error: 'Cat not found' });
            if (cat.user_id !== req.user.userId) return res.status(403).json({ error: 'Not your cat' });

            const { vaccine_name, date_given } = req.body;
            if (!vaccine_name) return res.status(400).json({ error: 'Vaccine name is required' });

            const certificateUrl = req.file ? `/uploads/certificates/${req.file.filename}` : null;
            const vaccinationId = await vaccinationModel.create({
                cat_id: req.params.id,
                vaccine_name,
                date_given,
                certificate_url: certificateUrl
            });

            res.status(201).json({ message: 'Vaccination added', vaccinationId, certificate_url: certificateUrl });
        } catch (error) {
            console.error('Add vaccination error:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });
});

// GET /api/cats/:id/vaccinations
router.get('/cats/:id/vaccinations', verifyToken, async (req, res) => {
    try {
        const cat = await catModel.getById(req.params.id);
        if (!cat) return res.status(404).json({ error: 'Cat not found' });
        if (cat.user_id !== req.user.userId) return res.status(403).json({ error: 'Not your cat' });

        const vaccinations = await vaccinationModel.getByCatId(req.params.id);
        res.json({ data: vaccinations });
    } catch (error) {
        console.error('Get vaccinations error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/vaccinations/:id
router.delete('/vaccinations/:id', verifyToken, async (req, res) => {
    try {
        const vaccination = await vaccinationModel.getById(req.params.id);
        if (!vaccination) return res.status(404).json({ error: 'Vaccination not found' });

        const cat = await catModel.getById(vaccination.cat_id);
        if (!cat) return res.status(404).json({ error: 'Cat not found' });
        if (cat.user_id !== req.user.userId) return res.status(403).json({ error: 'Not your cat' });

        deleteFile(vaccination.certificate_url);
        await vaccinationModel.remove(req.params.id);

        res.json({ message: 'Vaccination deleted' });
    } catch (error) {
        console.error('Delete vaccination error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
