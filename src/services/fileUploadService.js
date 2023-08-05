const path = require('path');
const multer = require('multer');
const { v4: uuid4 } = require('uuid');

// Using multer to upload files
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(
            Math.random() * 1e9
        )}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 100000000 },
}).single('myfile');

// Service function to upload the file and return the file details
exports.uploadFile = (req) => {
    return new Promise((resolve, reject) => {
        upload(req, null, (err) => {
            if (err) {
                return reject(err);
            }

            if (!req.file) {
                return reject(new Error('All fields are required.'));
            }

            const fileDetails = {
                filename: req.file.filename,
                uuid: uuid4(),
                path: req.file.path,
                size: req.file.size,
            };

            resolve(fileDetails);
        });
    });
};
