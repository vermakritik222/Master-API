const tokenService = require('../services/token.service');
const catchAsync = require('../utils/chtchasync');
const handlerFactory = require('../services/handlerFactory.service');
const User = require('../models/user.model');
const AppError = require('../utils/appError');

exports.protect = catchAsync(async (req, res, next) => {
    // 1) getting token and check of its there
    const { accessToken } = req.cookies;
    if (!accessToken) {
        return next(
            new AppError(
                'You are not longed in! Pleas log in to get access.',
                401
            )
        );
    }
    
    // 2) verification of token
    const decode = await tokenService.verifyAccessToken(accessToken);

    // 3) check if user still exists
    const freshUser = await handlerFactory.findById(User, decode._id);
    if (!freshUser) {
        return next(
            new AppError(
                'The token belonged to this User is no longer exist.',
                401
            )
        );
    }

    // 4) check if user changed pas after the token was issued
    if (freshUser.changedPasswordAfter(decode.iat)) {
        return next(
            new AppError(
                'User has changed there Password! please login again',
                401
            )
        );
    }

    // Grant access to protected rout
    req.user = freshUser;
    next();
});
