const crypto = require('crypto');
const {sha256} = require("./encryption.service.js");

exports.generateOtp = async () => {
    const otp = crypto.randomInt(1000, 9999);
    return otp;
};

exports.sendByMail = async (email, otp) => {
    console.log(`Your OTP is ${otp}`);
    return { otp };
};

exports.verifyOtpService = (hashedOtp, data) => {
    let computedHash = sha256(data);
    return computedHash === hashedOtp;
};
