const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please tell us your name!!!!'],
        },
        avatar: {
            type: String,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        role: {
            type: String,
            enum: {
                values: ['vender', 'user', 'none'],
            },
            default: 'user',
        },

        dateOfBirth: {
            type: Date,
            required: true,
        },
        password: {
            type: String,
            required: [true, 'Please create an password'],
            minlength: [6, 'A password must have 6 characters'],
            select: false,
        },
        passwordConformation: {
            type: String,
            required: [true, 'Please confirm your password'],
            validate: {
                validator: function (el) {
                    return el === this.password;
                },
                message: 'password are not same',
            },
        },
        passwordChangedAt: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
        activated: {
            type: Boolean,
            default: false,
        },
        idDeleted: {
            type: Boolean,
            default: false,
            select: false,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConformation = undefined;

    next();
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
});

// Instance Method's
userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamps = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );
        return JWTTimestamp < changedTimestamps;
    }
    return false;
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    console.log(resetToken, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
