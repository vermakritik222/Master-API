const fileUploadService = require('../services/fileUploadService');
const File = require('../models/fileModel');
const AppError = require('../utils/appError');
const catchAsync = require("../utils/chtchasync")

exports.saveFile = catchAsync(async (req, res) => {
    try {
        const fileDetails = await fileUploadService.uploadFile(req);

        const file = new File(fileDetails);

        const response = await file.save();

        return res.json({
            response,
            file: `${process.env.APP_BASE_URL}/files/${response.uuid}`,
        });
    } catch (error) {
        return next(new AppError('Something went wrong!'), 500);
    }
});

exports.downloadLinkGeneration = catchAsync(async (req, res) => {
    try {
        const file = await File.findOne({ uuid: req.params.uuid });
        if (!file) {
            return next(new AppError('Link has been expired!'), 500);
        }
        return res.json({
            uuid: file.uuid,
            fileName: file.filename,
            fileSize: file.size,
            downloadLink: `${process.env.APP_BASE_URL}/files/download/${file.uuid}`,
        });
    } catch (err) {
        return next(new AppError('Something went wrong!'), 500);
    }
});

exports.downloadFile = catchAsync(async (req, res) => {
    const file = await File.findOne({ uuid: req.params.uuid });
    if (!file) {
        return next(new AppError('Link has been expired!'), 500);
    }
    const filePath = `${__dirname}/../../${file.path}`;
    res.download(filePath);
});
