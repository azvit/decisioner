const mongoose = require('mongoose');
const adminSchema = mongoose.Schema({
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
    surname: {
        type: String,
        required: [true, 'Surname required']
    },
    lastname: String
});

const Admin = mongoose.model('admins', adminSchema, 'admins');

module.exports = Admin;
