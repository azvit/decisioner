const mongoose = require('mongoose');
const {METHODS} = require("../../app/Constants");
const groupExpertiseSchema = new mongoose.Schema({
    creator: {
        type: mongoose.Schema.ObjectId,
        ref: 'users',
        required: [true, 'Creator required!']
    },
    name: {
        type: String,
        required: [true, 'Group name required!']
    },
    expertsWeight: Array,
    experts: [{type: mongoose.Schema.ObjectId, ref: 'users'}],
    invitedExperts: [{type: mongoose.Schema.ObjectId, ref: 'users'}],
    blanks: [{type: mongoose.Schema.ObjectId, ref: 'blanks'}],
    isClosed: Boolean,
    template: {
        aim: {
            type: String,
            required: [true, 'Aim required!']
        },
        description: {
            type: String,
            required: [true, 'Description required!']
        },
        items: {
            type: Array,
            required: [true, 'Items required!']
        },
        itemsDescription: Array,
        criteria: {
            type: Array,
            required: [true, 'Criteria required!']
        },
        criteriaDescription: Array,
        method: {
            type: String,
            enum: METHODS,
            required: [true, 'Method required!']
        },
    },
    creationDate: Date,
    result: Object
});
const GroupExpertise = mongoose.model('group-expertises', groupExpertiseSchema, 'group-expertises');
module.exports = GroupExpertise;
