const { promisify } = require('util');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const User = require('../../models/users/userModel');
const catchAsync = require('../../utils/chtchasync');
const sendEmail = require('../../services/emailService');
const AppError = require('../../utils/appError');
const encryptionService = require('../../services/encryptionService');

const signToken = (data) =>
    jwt.sign(data, process.env.JWT_ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

const createSendToken = (user, statusCode, res) => {
    const token = signToken({ id: user._id, access: user.access });

    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };

    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);
    //  Removing password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token_type: 'Bearer',
        token,
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const organizationId = uuidv4();
    const newUser = await User.create({
        name: req.body.name,
        userName: req.body.userName,
        email: req.body.email,
        password: req.body.password,
        passwordConformation: req.body.passwordConformation,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role,
        access: ['/all'],
        organizationId: organizationId,
    });
    createSendToken(newUser, 201, res);
});

exports.genOrgUserToken = catchAsync(async (req, res, next) => {
    const user = req.user;
    const data = {
        createdBy: user._id,
        organizationId: user.organizationId,
        role: req.body.role,
        access: req.body.access,
    };

    if (!req.body.role || !req.body.access) {
        return next(new AppError('please enter required fields', 400));
    }

    if (typeof req.body.access !== 'object' && req.body.access.length > 0) {
        return next(
            new AppError('please enter required fields in proper formate', 400)
        );
    }

    const token = encryptionService.createDataToken(data);
    const decryptData = encryptionService.decryptDataToken(token);

    res.status(200).json({
        status: 'success',
        decryptData,
        signup_url: `${process.env.APP_BASE_URL}/jwt/signup/${token}`,
    });
});

exports.orgSignup = catchAsync(async (req, res, next) => {
    const token = req.params.token;
    const decryptData = encryptionService.decryptDataToken(token);
    const { createdBy, organizationId, role, access } = decryptData;
    const newUser = await User.create({
        name: req.body.name,
        userName: req.body.userName,
        email: req.body.email,
        password: req.body.password,
        passwordConformation: req.body.passwordConformation,
        passwordChangedAt: req.body.passwordChangedAt,
        createdBy,
        role,
        access,
        organizationId,
    });
    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('please enter email and password!', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    // correctPassword is an instance function available everywhere in user's module
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incurrent email or password'));
    }
    // 3) send token
    createSendToken(user, 200, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(
            new AppError('There is no user with that email address', 404)
        );
    }
    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    // console.log(resetToken);
    await user.save({ validateBeforeSave: false });
    // 3) send it to user's email
    const resetURL = `${req.protocol}://${req.get(
        'host'
    )}/api/v1/jwt/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min)',
            message,
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!',
        });
    } catch (err) {
        console.log(err);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
            new AppError(
                'There was an error sending the email. Try again later!'
            ),
            500
        );
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    //1) get the token and encrypt it
    const hashToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    //2) get the user and velodate exprie of token
    const user = await User.findOne({
        passwordResetToken: hashToken,
        passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) {
        return next(new AppError('Token is invalid or has expired'));
    }
    user.password = req.body.password;
    user.passwordConformation = req.body.passwordConformation;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    // 3) login user
    createSendToken(user, 200, res);
});

//FIXME:

exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('password');
    // 2) check if POSTed current password is correct
    if (!user.correctPassword(user.password, req.body.currentPassword)) {
        next(new AppError('Your current password is wrong', 401));
    }
    // 3)if so update password
    user.password = req.body.Password;
    user.passwordConformation = req.body.passwordConformation;
    await user.save();
    // 4)log user in send jwt
    createSendToken(user, 200, res);
});
