const mongoose = require('mongoose');

const musicSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    img: {
        type: String,
        required: true,
    },
    Category: {
        type: String,
        required: true,
    },
    Rating: {
        type: Number,
        required: true,
    },
    Description: {
        type: String,
    },
});

const Music = mongoose.model('music', musicSchema);

module.exports = Music;
