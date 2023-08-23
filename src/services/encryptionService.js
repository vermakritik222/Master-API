const crypto = require('crypto');

exports.createDataToken = (data) => {
    const dataString = JSON.stringify(data);

    const cipher = crypto.createCipher('aes-256-cbc', process.env.TOKEN_SECRET);

    let encryptedData = cipher.update(dataString, 'utf-8', 'hex');
    encryptedData += cipher.final('hex');

    return encryptedData;
};

exports.decryptDataToken = (token) => {
    // Decrypt the data
    const decipher = crypto.createDecipher(
        'aes-256-cbc',
        process.env.TOKEN_SECRET
    );

    // Decrypt the encrypted data
    let decryptedData = decipher.update(token, 'hex', 'utf-8');
    decryptedData += decipher.final('utf-8');

    return JSON.parse(decryptedData);
};

exports.hash256 = (data) => {
    return crypto
        .createHmac('sha256', process.env.HASH_SECRET)
        .update(data)
        .digest('hex');
};
