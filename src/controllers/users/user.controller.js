const catchAsync = require('../../utils/chtchasync');
const User = require('../../models/user.model');
const handlerFactory = require('../../services/handlerFactory.service');
const AppError = require('../../utils/appError');

exports.getMe = (req, res, next) => {
    res.json({ user: req.user });
};

exports.updateMe = catchAsync(async (req, res, next) => {
    const { name, dateOfBirth } = req.body;
    const { _id } = req.user;

    const user = await handlerFactory.updateOne(User, {_id}, {
        name,
        dateOfBirth,
    });

    res.status(200).json({
        status: 'success',
        user,
    });
});
