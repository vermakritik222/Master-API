const User = require('../../models/users/userModel');
const catchAsync = require('../../utils/chtchasync');
const AppError = require('../../utils/appError');
const handlerFactory = require('../../services/handlerFactoryService');

exports.deleteMe = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null,
    });
});

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

exports.getUser = handlerFactory.getOne(User);
