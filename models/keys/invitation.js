const mongoose = require('mongoose');

const invitationSchema = mongoose.Schema({
    creator: {
        type: mongoose.Schema.ObjectId,
        ref: 'experts'
    },
    expertise: {
        type: mongoose.Schema.ObjectId,
        ref: 'group-expertises'
    },
    target: {
        type: mongoose.Schema.ObjectId,
        ref: 'experts'
    },
    expertiseName: String,
    key: String,
    expireAt: {
        type: Date,
        default: Date.now,
        index: { expires: 7200000}
    }
});

const Invitations = mongoose.model('invitations', invitationSchema);

module.exports = Invitations;
