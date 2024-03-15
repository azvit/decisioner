const mongoose = require('mongoose');
const {METHODS} = require("../../app/Constants");

const blankSchema = new mongoose.Schema({
    creator: {
        type: mongoose.Schema.ObjectId,
        ref: 'users',
        required: [true, 'Creator required!']
    },
    name: {
        type: String,
        required: [true, 'Name required!']
    },
    groupExpertise: {
        type: mongoose.Schema.ObjectId,
        ref: 'group-expertises'
    },
    method: {
        type: String,
        enum: METHODS,
        required: [true, 'Method required!']
    },
    blank: {
        aim: {
            type: String,
            required: [true, 'Aid required!']
        },
        description: {
            type: String,
            required: [true, 'Description required!']
        },
        items: Array,
        itemsDescription: Array,
        criteria: Array,
        criteriaDescription: Array,
        criteriaItemRank: Array,
        criteriaRank: Array
    },
    result: Object,
    creationDate: Date,
    isClosed: Boolean
});

const Blank = mongoose.model('blanks', blankSchema, 'blanks');

module.exports = Blank;
