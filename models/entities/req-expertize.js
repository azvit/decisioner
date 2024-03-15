const mongoose = require('mongoose');

const reqExpertizeSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.ObjectId,
        ref: 'clients',
        required: [true, 'Client required!']
    },
    name: {
        type: String,
        required: [true, 'Name required!']
    },
    isExpertizePrivate: {
        type: Boolean,
        required: [true, 'IsPrivate?']
    },
    isValidated:{
        type: Boolean,
        required: [true, 'IsValidated?']
    },
    isClosed: {
        type: Boolean,
        required: [true, 'IsClosed?']
    },
    template: {
        items: {
            type: Array,
            required: [true, 'Items required!'],
            validate: v => v == null || v.length > 0
        },
        criteria: {
            type: Array,
            required: [true, 'Criteria required!'],
            validate: v => v == null || v.length > 0
        }
    },
    creationDate: Date
})

const ReqExpertize = mongoose.model('expertize-requests', reqExpertizeSchema);

module.exports = ReqExpertize;
