const mongoose = require('mongoose');

const passwordKeySchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'users',
        unique: true,
        require: true
    },
    key: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true,
    },
    salt: {
        type: String,
        require: true
    },
    expireAt: {
        type: Date,
        default: Date.now,
        index: { expires: 900000}
    }
})

const PasswordKey = mongoose.model('password-keys', passwordKeySchema, 'password-keys');

module.exports = PasswordKey;
