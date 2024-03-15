const Blanks = require('../../models/entities/blank');
const Expertises = require('../../models/entities/group-experise');
const Experts = require("../../models/users/expert");
const Admin = require("../../models/users/admin");
const Users = require('../../models/users/user');
const successMsg = require('../Constants').SUCCESS_MESSAGE;
const notFoundMsg = require('../Constants').NOT_FOUND_MESSAGE;

exports.getBlanks = async function (limit, skip, search, filter) {
    let blanks;
    let count;
    switch (filter) {
        case "name": {
            blanks = await blankList({name: search, groupExpertise: null}, skip, limit);
            break;
        }
        case "creator": {
            blanks = await blankByCreator(search, skip, limit);
            break;
        }
        /*case "creationDate": {
            blanks = await blankList({creationDate: search, groupExpertise: null}, skip, limit);
            break;
        }*/
        default: {
            blanks = await blankList({groupExpertise: null}, skip, limit);
        }
    }
    return blanks;
}

async function blankByCreator (data, skip, limit) {
    let experts = await expertList({name: data}, 0, 0);
    let ids = []
    for (let i = 0; i < experts.length; i++) {
        ids.push(experts[i]._id);
    }
    let blanks = await Blanks.find({creator: {$in: ids}, groupExpertise: null}).populate('creator').skip(skip).limit(limit);
    let count = await Blanks.count({creator: {$in: ids}});
    return {blanks: blanks, count: count}
}

async function blankList (data, skip, limit) {
    let blanks = await Blanks.find(data).skip(skip).limit(limit).populate('creator');
    let count = await Blanks.count(data);
    return {blanks: blanks, count: count};
}

exports.getExpertises = async function (limit, skip, search, filter) {
    let expertises;
    let count;
    switch (filter) {
        case "name": {
            expertises = await expertiseList({name: search}, skip, limit);
            break;
        }
        case "creator": {
            expertises = await expertiseList({creator: search}, skip, limit);
            break;
        }
        case "creationDate": {
            expertises = await expertiseList({creationDate: search}, skip, limit);
            break;
        }
        case "experts": {
            expertises = await expertiseList({experts: {$all: search}}, skip, limit);
            break;
        }
        default: {
            expertises = await expertiseList({}, skip, limit);
        }
    }
    return expertises;
}

async function expertiseList (data, skip, limit) {
    let expertises = await Expertises.find(data).skip(skip).limit(limit).populate('blanks');
    let count = await Expertises.count(data);
    return {expertises: expertises, count: count};
}

exports.getExpertiseFull = function (groupId) {
    return Expertises.findById(groupId).populate('blanks').populate('experts');
}

exports.getExperts = async function (limit, skip, search, filter) {
    let experts;
    let count;
    switch (filter) {
        case "name": {
            experts = await expertList({name: search}, skip, limit);
            count = await Users.count({name: search})
            break;
        }
        case "email": {
            experts = await expertList({email: search}, skip, limit);
            count = 1;
            break;
        }
        case "phone": {
            experts = await expertList({phone: search}, skip, limit);
            count = 1;
            break;
        }
        case "activitySphere": {
            experts = await expertList({activitySphere: search}, skip, limit);
            count = await Users.count({activitySphere: search});
            break;
        }
        default: {
            experts = await expertList({}, skip, limit);
            count = await Users.count()
        }
    }
    console.log(count);
    return {experts: experts, count: count};
}

function expertList (data, skip, limit) {
    return Users.find(data).skip(skip).limit(limit).select(['-login', '-password']);
}

exports.deleteUser = function (id) {
    Users.findByIdAndDelete(id);
    return successMsg;
}

exports.changeRole = async function (id, role) {
    await Users.findByIdAndUpdate(id, {role: role});
    return successMsg
}

exports.updateUser = async function (id, data) {
    await Users.findByIdAndUpdate(id, data).catch(() => {
        return notFoundMsg;
    }).then(() => {
        return successMsg;
    })
}

