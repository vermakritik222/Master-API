exports.healthCheck = (req, res) => {
    return res.status(200).json({
        status: 'OK',
        msg: 'Health check passed',
    });
};
