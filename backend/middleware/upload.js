const multer = require('multer');
const path = require('path');
const fs = require('fs');

const makeStorage = (folder) => {
    const uploadPath = path.join(__dirname, '..', 'uploads', folder);

    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }

    return multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
            cb(null, uniqueName);
        }
    });
};

const imageFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(file.mimetype)) {
        return cb(new Error('Only JPG and PNG files are allowed'));
    }
    cb(null, true);
};

const certificateFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowed.includes(file.mimetype)) {
        return cb(new Error('Only JPG, PNG, and PDF files are allowed'));
    }
    cb(null, true);
};

const photoUpload = multer({
    storage: makeStorage('cats'),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: imageFilter
});

const certificateUpload = multer({
    storage: makeStorage('certificates'),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: certificateFilter
});

const avatarUpload = multer({
    storage: makeStorage('avatars'),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: imageFilter
});

module.exports = { photoUpload, certificateUpload, avatarUpload };
