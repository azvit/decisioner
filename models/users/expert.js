const mongoose = require('mongoose');

const expertSchema = mongoose.Schema({
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
    degree: {
        type: String,
        required: [true, 'Degree required']
    },
    academicStatus: {
        type: String,
        required: [true, 'Academic status required']
    },
    expertiseHistory: Array,
    direction: {
        type: String,
        required: [true, 'Direction required']
    },
    activitySphere: {
        type: String,
        required: [true, 'Activity sphere required']
    }
});

const Experts = mongoose.model('experts', expertSchema);
module.exports = Experts;
