const mongoose = require('mongoose');

const clientSchema = mongoose.Schema({
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

const Clients = mongoose.model('clients', clientSchema);
module.exports = Clients;
