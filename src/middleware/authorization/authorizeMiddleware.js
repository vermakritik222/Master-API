const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../../models/userModel');
const catchAsync = require('../../utils/chtchasync');
const AppError = require('../../utils/appError');

exports.protect = catchAsync(async (req, res, next) => {
    // 1) getting token and check of its there
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(
            new AppError(
                'You are not longed in! Pleas log in to get access.',
                401
            )
        );
    }
    // 2) verification of token
    const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) check if user still exists
    const freshUser = await User.findById(decode.id);
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

exports.restrictToUrl = (req, res, next) => {
    const userAccess = req.user.access;
    const requestURL = req.url.replace('/api/v1', '');

    if (userAccess.includes('/all')) {
        return next();
    } else if (userAccess.includes(`/${requestURL.split('/')[1]}/all`)) {
        return next();
    } else if (userAccess.includes(requestURL)) {
        return next();
    }

    next(
        new AppError('You do not have peremption to perform this action', 403)
    );
};


// as we can't take direct input in middleware function
exports.restrictToRole =
    (...role) =>
    (req, res, next) => {
        if (!role.includes(req.user.role)) {
            return next(
                new AppError(
                    'You do not have peremption to perform this action',
                    403
                )
            );
        }
        next();
    };
