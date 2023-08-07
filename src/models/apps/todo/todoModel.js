const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        // ref: 'User',
        required: true,
    },
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            //  ref: 'User'
        },
    ],
    due_date: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['open', 'completed', 'canceled'],
        default: 'open',
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

const Todo = mongoose.model('todo', todoSchema);

module.exports = Todo;
