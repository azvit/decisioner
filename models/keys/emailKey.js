const mongoose = require('mongoose');

const emailKeySchema = mongoose.Schema({
    key: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'users',
        required: [true, 'User required!']
    },
    expireAt: {
        type: Date,
        default: Date.now,
        index: { expires: 900000}
    }
});

const EmailKey = mongoose.model('email-keys', emailKeySchema, 'email-keys');

module.exports = EmailKey;
