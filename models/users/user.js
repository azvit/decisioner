const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    login: {
        type: String,
        unique: [true, 'Login duplication!'],
        required: [true, 'Login required!'],
        select: false
    },
    password: {
        type: String,
        required: [true, 'Password required'],
        select: false
    },
    salt: {
        type: String,
        required: true,
        select: false
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
    emailKey: {
        type: String,
        expiresAt: Date,
        select: false
    },
    role: {
        type: String,
        required: [true, 'Role required'],
        enum: [
            'superadmin',
            'admin',
            'moderator',
            'expert',
            'client'
        ]
    }
});

const Users = mongoose.model('users', userSchema, 'users');
module.exports = Users;
