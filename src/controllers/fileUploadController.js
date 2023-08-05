const fileUploadService = require('../services/fileUploadService');
const File = require('../models/fileModel');

exports.saveFile = async (req, res) => {
    try {
        const fileDetails = await fileUploadService.uploadFile(req);

        const file = new File(fileDetails);

        const response = await file.save();

        return res.json({
            response,
            file: `${process.env.APP_BASE_URL}/files/${response.uuid}`,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 'fail',
            error: 'Something went wrong.',
        });
    }
};

exports.downloadLinkGeneration = async (req, res) => {
    try {
        const file = await File.findOne({ uuid: req.params.uuid });
        if (!file) {
            return res.json({ error: 'Link has been expired.' });
        }
        return res.json({
            uuid: file.uuid,
            fileName: file.filename,
            fileSize: file.size,
            downloadLink: `${process.env.APP_BASE_URL}/files/download/${file.uuid}`,
        });
    } catch (err) {
        return res.json({ error: 'something went wrong.' });
    }
};

exports.downloadFile = async (req, res) => {
    const file = await File.findOne({ uuid: req.params.uuid });
    if (!file) {
        return res.json({ error: 'Link has been expired' });
    }
    const filePath = `${__dirname}/../../${file.path}`;
    res.download(filePath);
};
