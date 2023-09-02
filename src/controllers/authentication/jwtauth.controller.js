const catchAsync = require('../../utils/chtchasync');
const AppError = require('../../utils/appError');
const User = require('../../models/user.model');
const tokenService = require('../../services/token.service');
const handlerFactory = require('../../services/handlerFactory.service');
const otpService = require('../../services/otp.service');
const sendEmail = require('../../services/email.service');
const {
    sha256,
    encrypt256cbc,
    decrypt256cbc,
} = require('../../services/encryption.service');

exports.signup = catchAsync(async (req, res, next) => {
    const {
        name,
        email,
        password,
        passwordConformation,
        passwordChangedAt,
        role,
        dateOfBirth,
    } = req.body;

    const user = await handlerFactory.createOne(User, {
        name,
        email,
        password,
        passwordConformation,
        passwordChangedAt,
        role,
        dateOfBirth,
    });

    if (!email) {
        return next(new AppError('email field is required!', 400));
    }

    const otp = await otpService.generateOtp();

    const ttl = 1000 * 60 * 2; // 2 min
    const expires = Date.now() + ttl;
    const data = `${email}.${otp}.${expires}`;
    const hash = sha256(data);

    await otpService.sendByMail(email, otp);

    res.status(201).json({
        user,
        hash: `${hash}.${expires}`,
        email,
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('please enter email and password!', 400));
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incurrent email or password'));
    }

    if (!user.activated) {
        return res.status(401).json({
            status: 'fail',
            user,
            error: 'login failed you have not confirmed you email!',
        });
    }

    const { accessToken, refreshToken } = tokenService.generateTokens({
        _id: user._id,
        activated: false,
    });

    await tokenService.storeRefreshToken(refreshToken, user._id);

    res.cookie('refreshToken', refreshToken, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
    });

    res.cookie('accessToken', accessToken, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
    });

    res.status(200).json({
        status: 'success',
        error: null,
        user,
        auth: true,
    });
});

exports.sendOtp = catchAsync(async (req, res, next) => {
    const { userId } = req.body;

    if (!userId) {
        return next(new AppError('please enter userId!', 400));
    }

    const user = await handlerFactory.find(User, { _id: userId });
    const { email } = user;

    const otp = await otpService.generateOtp();

    const ttl = 1000 * 60 * 2; // 2 min
    const expires = Date.now() + ttl;
    const data = `${email}.${otp}.${expires}`;
    const hash = sha256(data);

    await otpService.sendByMail(email, otp);

    res.status(200).json({
        status: 'success',
        hash: `${hash}.${expires}`,
        email,
    });
});

exports.verifyOtp = catchAsync(async (req, res, next) => {
    const { otp, hash, email } = req.body;

    if (!otp || !hash || !email) {
        return next(new AppError('All fields are required!', 400));
    }

    const [hashedOtp, expires] = hash.split('.');

    if (Date.now() > +expires) {
        return next(new AppError('OTP expired!', 400));
    }

    const data = `${email}.${otp}.${expires}`;

    const isValid = otpService.verifyOtpService(hashedOtp, data);

    if (!isValid) {
        return next(new AppError('Invalid OTP', 400));
    }

    const user = await handlerFactory.updateOne(
        User,
        { email },
        { activated: true }
    );

    const { accessToken, refreshToken } = tokenService.generateTokens({
        _id: user._id,
        activated: false,
    });

    await tokenService.storeRefreshToken(refreshToken, user._id);

    res.cookie('refreshToken', refreshToken, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
    });

    res.cookie('accessToken', accessToken, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
    });

    res.json({ user, auth: true });
});

exports.refresh = catchAsync(async (req, res,next) => {
    // get refresh token from cookie
    const { refreshToken: refreshTokenFromCookie } = req.cookies;
    // check if token is valid
    let userData;
    try {
        userData = await tokenService.verifyRefreshToken(
            refreshTokenFromCookie
        );
    } catch (err) {
        return next(new AppError('Invalid Token', 401));
    }

    // Check if token is in db
    const token = await tokenService.findRefreshToken(
        userData._id,
        refreshTokenFromCookie
    );
    if (!token) {
        return next(new AppError('Invalid Token', 401));
    }

    // check if valid user
    const user = await handlerFactory.find(User, { _id: userData._id });
    if (!user) {
        return next(new AppError('No user', 404));
    }
    // Generate new tokens
    const { refreshToken, accessToken } = tokenService.generateTokens({
        _id: userData._id,
    });

    // Update refresh token
    await tokenService.updateRefreshToken(userData._id, refreshToken);

    // put in cookie
    res.cookie('refreshToken', refreshToken, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
    });

    res.cookie('accessToken', accessToken, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
    });

    res.json({ user, auth: true });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(
            new AppError('There is no user with that email address', 404)
        );
    }

    const resetToken = user.createPasswordResetToken();

    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get(
        'host'
    )}/api/v1/auth/resetPassword/${resetToken}`;

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
    const hashToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

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

    const { accessToken, refreshToken } = tokenService.generateTokens({
        _id: user._id,
        activated: false,
    });

    await tokenService.storeRefreshToken(refreshToken, user._id);

    res.cookie('refreshToken', refreshToken, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
    });

    res.cookie('accessToken', accessToken, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
    });

    res.json({ user, auth: true });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('password');

    if (!user.correctPassword(user.password, req.body.currentPassword)) {
        return next(new AppError('Your current password is wrong', 401));
    }

    user.password = req.body.Password;
    user.passwordConformation = req.body.passwordConformation;
    await user.save();



    const { accessToken, refreshToken } = tokenService.generateTokens({
        _id: user._id,
        activated: false,
    });

    await tokenService.storeRefreshToken(refreshToken, user._id);

    res.cookie('refreshToken', refreshToken, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
    });

    res.cookie('accessToken', accessToken, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
    });

    res.json({ status:"success",msg:"Password is Updated successfully", auth: true });
});

exports.updateEmailRequest = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('password');

    if (!user.correctPassword(user.password, req.body.currentPassword)) {
        return next(new AppError('password is incorrect', 401));
    }

    const data = {
        id: user._id,
        email: req.body.email,
        expires: Date.now() + 5 * 60 * 1000,
    };

    const token = encrypt256cbc(data);
    const emailVerifyLink = `${process.env.BASE_URL}/api/v${process.env.APP_VERSION}/email-verify/${token}`;
    const message = `Pleas verify your email by clicking no ${emailVerifyLink}`;

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

exports.updateEmailVerify = catchAsync(async (req, res, next) => {
    const { token } = req.params;
    const tokenData = decrypt256cbc(token);

    if (tokenData.expires < Date.now()) {
        return next(new AppError('token has been expired', 400));
    }

    if (tokenData.id != req.user._id) {
        return next(new AppError('Unauthorized Access', 401));
    }

    const user = await handlerFactory.findById(User,tokenData.id);

    if (!user) {
        return next(
            new AppError('Something went wrong please try again later', 400)
        );
    }
    user.email = tokenData.email;

    await user.save({ validateBeforeSave: false });

    res.status(202).json({
        status: 'success',
        msg: 'email is successfully updated',
        user,
    });
});

exports.logout = catchAsync(async (req, res, next) => {
    const { refreshToken } = req.cookies;
    await tokenService.removeToken(refreshToken);

    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');
    res.json({ user: null, auth: false });
});
