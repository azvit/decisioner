const mongoose = require('mongoose');

const unconfirmedUserSchema = mongoose.Schema({
    login: {
        type: String,
        unique: [true, 'Login duplication!'],
        required: [true, 'Login required!']
    },
    password: {
        type: String,
        required: [true, 'Password required']
    },
    email: { type: String, required: true, unique: [true, 'email duplication!'] },
    name: {
        type: String,
        required: [true, 'Name required']
    },
    phone: {
        type: String,
        required: [true, 'Phone number required']
    },
    salt: {
        type: String,
        required: true
    },
    degree: String,
    academicStatus: String,
    expertiseHistory: Array,
    direction: {
        type: String,
        required: [true, 'Direction required']
    },
    activitySphere: {
        type: String,
        required: [true, 'Activity sphere required']
    },
    key: {
        type: String,
        required: true
    },
    expireAt: {
        type: Date,
        default: Date.now,
        index: { expires: 900000}

    },
})

const UnconfirmedUser = mongoose.model('unconfirmedUsers', unconfirmedUserSchema, 'unconfirmed-users');

module.exports = UnconfirmedUser;
