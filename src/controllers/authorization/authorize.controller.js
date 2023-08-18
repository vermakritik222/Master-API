const Jimp = require('jimp');
const path = require('path');
const handlerFactoryService = require('../../services/handlerFactoryService2');
const User = require('../../models/users/userModel');

exports.activate = async (req, res) => {
    // Activation logic
    const { name, avatar } = req.body;
    if (!name || !avatar) {
        res.status(400).json({ message: 'All fields are required!' });
    }

    // Image Base64
    const buffer = Buffer.from(
        avatar.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''),
        'base64'
    );
    const imagePath = `${Date.now()}-${Math.round(Math.random() * 1e9)}.png`;
    // 32478362874-3242342342343432.png

    try {
        const jimResp = await Jimp.read(buffer);
        jimResp
            .resize(150, Jimp.AUTO)
            .write(path.resolve(__dirname, `../../../uploads/${imagePath}`));
    } catch (err) {
        res.status(500).json({ message: 'Could not process the image' });
    }

    const userId = req.user._id;
    // Update user
    try {
        const user = await handlerFactoryService.find(User, { _id: userId });
        if (!user) {
            res.status(404).json({ message: 'User not found!' });
        }
        user.activated = true;
        user.name = name;
        user.avatar = `/uploads/${imagePath}`;
        user.save();
        res.json({ user, auth: true });
    } catch (err) {
        res.status(500).json({ message: 'Something went wrong!' });
    }
};
