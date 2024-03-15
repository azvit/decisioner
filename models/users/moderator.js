const mongoose = require('mongoose');
const moderatorSchema = mongoose.Schema({
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
    }
});

const Moderator = mongoose.model('moderators', moderatorSchema);

module.exports = Moderator;
