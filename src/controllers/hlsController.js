const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
    // fires argument of this function is error which is null
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

exports.uploadingFile = (req, res) => {
    // store file
    upload(req, res, async (err) => {
        // validate request
        try {
            if (!req.file) {
                return res.json({
                    status: 'fail',
                    error: 'All fields are required.',
                });
            }

            if (err) {
                return res.status(500).json({
                    status: 'fail',
                    error: err.message,
                });
            }
            // Logic to convert .mp3 to HLS
        } catch (error) {
            console.log(error);
        }
    });
};
