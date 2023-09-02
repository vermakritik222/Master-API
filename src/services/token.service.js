const jwt = require('jsonwebtoken');
const refreshModel = require('../models/refresh.model');

const refreshTokenSecret = process.env.JWT_REFRESH_TOKEN_SECRET;
const accessTokenSecret = process.env.JWT_ACCESS_TOKEN_SECRET;

exports.generateTokens = (payload) => {
    const accessToken = jwt.sign(payload, accessTokenSecret, {
        expiresIn: '160m',
    });
    const refreshToken = jwt.sign(payload, refreshTokenSecret, {
        expiresIn: '1y',
    });
    return { accessToken, refreshToken };
};

exports.storeRefreshToken = async (token, userId) => {
    try {
        await refreshModel.create({
            token,
            userId,
        });
    } catch (err) {
        console.log(err.message);
    }
};

exports.verifyAccessToken = async (token) => {
    return jwt.verify(token, accessTokenSecret);
};

exports.verifyRefreshToken = async (refreshToken) => {
    return jwt.verify(refreshToken, refreshTokenSecret);
};

exports.findRefreshToken = async (userId, refreshToken) => {
    return await refreshModel.findOne({
        userId: userId,
        token: refreshToken,
    });
};

exports.updateRefreshToken = async (userId, refreshToken) => {
    return await refreshModel.updateOne(
        { userId: userId },
        { token: refreshToken }
    );
};

exports.removeToken = async (refreshToken) => {
    return await refreshModel.deleteOne({ token: refreshToken });
};
