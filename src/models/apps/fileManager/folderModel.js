const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema(
    {
        foldername: {
            type: String,
            required: true,
        },
        path: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: [null, 'master'],
            default: null,
        },
        sharedTo: [
            {
                type: mongoose.Schema.Types.ObjectId,
            },
        ],
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            require: false,
        },
        created: {
            type: Date,
            default: Date.now,
        },
        update: {
            type: Date,
            default: Date.now,
        },

    },
    {
        timestamps: true,
    }
);

const Folder = mongoose.model('folders', folderSchema);

module.exports = Folder;
