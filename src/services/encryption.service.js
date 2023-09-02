const crypto = require('crypto');

exports.sha256 = (data) => {
    return crypto
        .createHmac('sha256', process.env.HASH_SECRET)
        .update(data)
        .digest('hex');
};

exports.encrypt256cbc = (data) => {
    const dataString = JSON.stringify(data);

    const cipher = crypto.createCipher(
        'aes-256-cbc',
        process.env.HASH_256CBC_KEY
    );

    let encryptedData = cipher.update(dataString, 'utf-8', 'hex');
    encryptedData += cipher.final('hex');

    return encryptedData;
};

exports.decrypt256cbc = (token) => {
    // Decrypt the data
    const decipher = crypto.createDecipher(
        'aes-256-cbc',
        process.env.HASH_256CBC_KEY
    );

    // Decrypt the encrypted data
    let decryptedData = decipher.update(token, 'hex', 'utf-8');
    decryptedData += decipher.final('utf-8');

    return JSON.parse(decryptedData);
};
