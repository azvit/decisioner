const mongoose = require('mongoose');
const superadminSchema = mongoose.Schema({
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
    name: String
});

const Superadmin = mongoose.model('superadmins', superadminSchema);

module.exports = Superadmin;
