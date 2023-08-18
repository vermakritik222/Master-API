const otpService = require('../../services/otpService');
const { hash256 } = require('../../services/encryptionService');
const handlerFactoryService = require('../../services/handlerFactoryService2');
const tokenService = require('../../services/tokenService');
const User = require('../../models/users/userModel');

exports.sendOtp = async (req, res) => {
    const { phone } = req.body;
    if (!phone) {
        res.status(400).json({ message: 'Phone field is required!' });
    }

    const otp = await otpService.generateOtp();

    const ttl = 1000 * 60 * 2; // 2 min
    const expires = Date.now() + ttl;
    const data = `${phone}.${otp}.${expires}`;
    const hash = hash256(data);

    // send OTP
    try {
        await otpService.sendBySms(phone, otp);
        res.json({
            hash: `${hash}.${expires}`,
            phone,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'message sending failed' });
    }
};

exports.verifyOtp = async (req, res) => {
    const { otp, hash, phone } = req.body;
    if (!otp || !hash || !phone) {
        res.status(400).json({ message: 'All fields are required!' });
    }

    const [hashedOtp, expires] = hash.split('.');
    if (Date.now() > +expires) {
        res.status(400).json({ message: 'OTP expired!' });
    }

    const data = `${phone}.${otp}.${expires}`;
    const isValid = otpService.verifyOtp(hashedOtp, data);
    if (!isValid) {
        res.status(400).json({ message: 'Invalid OTP' });
    }

    let user;
    try {
        user = await handlerFactoryService.find(User, { "phone": phone });
        if (!user) {
            user = await handlerFactoryService.createOne(User, {
                "phone": phone,
            });
        }
        console.log(user);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Db error' });
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

    res.json({ user, auth: true });
};

exports.refresh = async (req, res) => {
    // get refresh token from cookie
    const { refreshToken: refreshTokenFromCookie } = req.cookies;
    // check if token is valid
    let userData;
    try {
        userData = await tokenService.verifyRefreshToken(
            refreshTokenFromCookie
        );
    } catch (err) {
        return res.status(401).json({ message: 'Invalid Token' });
    }
    // Check if token is in db
    try {
        const token = await tokenService.findRefreshToken(
            userData._id,
            refreshTokenFromCookie
        );
        if (!token) {
            return res.status(401).json({ message: 'Invalid token' });
        }
    } catch (err) {
        return res.status(500).json({ message: 'Internal error' });
    }
    // check if valid user
    const user = await handlerFactoryService.find(User, { _id: userData._id });
    if (!user) {
        return res.status(404).json({ message: 'No user' });
    }
    // Generate new tokens
    const { refreshToken, accessToken } = tokenService.generateTokens({
        _id: userData._id,
    });

    // Update refresh token
    try {
        await tokenService.updateRefreshToken(userData._id, refreshToken);
    } catch (err) {
        return res.status(500).json({ message: 'Internal error' });
    }
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
};

exports.logout = async (req, res) => {
    const { refreshToken } = req.cookies;
    // delete refresh token from db
    await tokenService.removeToken(refreshToken);
    // delete cookies
    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');
    res.json({ user: null, auth: false });
};
