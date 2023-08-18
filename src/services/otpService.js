const crypto = require('crypto');
const hashService = require("./encryptionService");

exports.generateOtp = async () => {
    const otp = crypto.randomInt(1000, 9999);
    return otp;
};

exports.sendBySms = async (phone, otp) => {
    console.log(`Your OTP is ${otp}`);
    return { otp };
};

exports.verifyOtp = (hashedOtp, data) => {
    let computedHash = hashService.hash256(data);
    return computedHash === hashedOtp;
};
