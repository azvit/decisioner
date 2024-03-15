const mongoose = require("mongoose");
const ReqExpertize = require('../../models/entities/req-expertize');
const GroupExpertize = require('../../models/entities/group-experise');
const notFoundMsg = require('../Constants').NOT_FOUND_MESSAGE;
const successMsg = require('../Constants').SUCCESS_MESSAGE;
const Blank = require('../../models/entities/blank');
const User = require('../../models/users/user')
const {RANGE_METHOD_MODES} = require("../Constants");
const {METHODS} = require("../Constants");
const Invitations = require("../../models/keys/invitation");

//--------Сервіс замовлень---------
exports.createRequest = async function (req) {
    req.body.client = req.user.id;
    req.body.isValidated = false;
    req.body.isClosed = false
    await ReqExpertize.create(req.body);
}

exports.updateRequest = async function (id, data) {
    await ReqExpertize.findByIdAndUpdate(id, data);
}

exports.validateReq = async function (reqId, userId) {
    let data = await ReqExpertize.findByIdAndUpdate(reqId, {isValidated: true});
    if (!data) {
        return {message: "Not Found"}
    }
    await prepareGroupExpertize(data.name, data.template, userId);
}

exports.deleteRequest = async function (id) {
    await ReqExpertize.findByIdAndDelete(id);
}

exports.getReqExp = function (data) {
    return ReqExpertize.find(data);
}

//--------Сервіс групових експертиз---------

exports.createGroupExpertize = async function (data, id) {
    data.creator = id;
    data.isClosed = false;
    data.creationDate = Date.now();
    await createGroup(data);
}

exports.createGroupFromBlank = async function (req) {
    let data = {};
    let blank = await getBlank({_id: req.params["blankId"]})
    data = {
        _id: mongoose.Types.ObjectId(),
        creator: req.user.id,
        experts: [],
        expertsWeight: [],
        invitedExperts: [],
        blanks: [],
        isClosed: true,
        name: blank[0].name,
        template: {
            items: blank[0].blank.items,
            criteria: blank[0].blank.criteria,
            method: blank[0].method,
            aim: blank[0].blank.aim,
            description: blank[0].blank.description,
            itemsDescription: blank[0].blank.itemsDescription,
            criteriaDescription: blank[0].blank.criteriaDescription
        },
        creationDate: Date.now(),
        result: {}
    }
    await createGroup(data);
}

exports.updateGroupExpertize = async function (id, data) {
    await updateGroup(id, data);
}
exports.confirmGroupExp = async function (id) {
    let blank = await getGroup({_id: id});
    let obj = blank[0].toObject();
    delete obj._id;
    obj.isClosed = true;
    const newBlank = new GroupExpertize(obj);
    await newBlank.save()
}
exports.addBlankToGroup = async function (req, data) {
    await updateGroup(req.params["groupId"], data);
    await Blank.findByIdAndUpdate(req.query.blankId, {groupExpertize: req.params["groupId"]});
}

exports.deleteGroupExpertize = async function (id) {
    let expertise = await GroupExpertize.findById(id);
    for (let i = 0; i < expertise.blanks.length; i++) {
        await deleteBlank(expertise.blanks[i]._id);
    }
    await GroupExpertize.findByIdAndDelete(id);
}

exports.getGroupExp = function (data) {
    return getGroup(data);
}

async function updateGroup (id, data) {
    await GroupExpertize.findByIdAndUpdate(id, data);
}

async function prepareGroupExpertize (name, template, id) {
    const data = {
        name: name,
        creator: id,
        template: template
    }
    await createGroup(data);
}

async function createGroup (data) {
    await GroupExpertize.create(data);
}

async function getGroup (data) {
    return GroupExpertize.find(data).populate('experts');
}

//--------Сервіс бланков---------

exports.getBlankExp = async function (data) {
    return await getBlank(data);
}

exports.createBlankExp = async function (data, id, groupExpertise, isClosed) {
    data.creator = id;
    data.groupExpertise = groupExpertise;
    data.creationDate = Date.now();
    data.isClosed = isClosed;
    let criteriaRank = [];
    let itemRank = [];
    switch(data.method) {

        case METHODS.AHP: {
            for (let i = 0; i < data.blank.criteria.length; i++) {
                for (let j = i + 1; j < data.blank.criteria.length; j++) {
                    criteriaRank.push([data.blank.criteria[i], data.blank.criteria[j], 1]);
                }
                itemRank.push([]);
                for (let j = 0; j < data.blank.items.length; j++) {
                    for (let q = j + 1; q < data.blank.items.length; q++) {
                        itemRank[i].push([data.blank.items[j], data.blank.items[q], 1]);
                    }
                }
            }
            data.blank.criteriaRank = criteriaRank;
            data.blank.criteriaItemRank = itemRank;
            break;
        }
        case METHODS.NORM: {
            for (let i = 0; i < data.blank.items.length; i++) {
                itemRank.push([]);
                for (let j = 0; j < data.blank.criteria.length; j++) {
                    itemRank[i].push(1)
                }
            }
            data.blank.criteriaItemRank = itemRank;
            break;
        }
        case METHODS.RANGE: {
            let rankedScores = []
            for (let i = 0; i < data.blank.items.length; i++) {
                itemRank.push([]);
                criteriaRank.push(0);
                for (let j = 0; j < data.blank.items.length; j++) {
                    if (i === j) {
                        itemRank[i].push('-')
                    } else {
                        itemRank[i].push(0.5);
                    }
                }
                rankedScores.push(0)
            }
            data.blank.criteria = [RANGE_METHOD_MODES.COMPARE];
            data.blank.criteriaItemRank = itemRank;
            break
        }

    }
    await createBlank(data);
}

exports.createBlankExpForExpertiseCreator = async function (data, userId, groupExpertise) {
    let newBlank = new Blank;
    newBlank.creator = userId;
    newBlank.groupExpertize = groupExpertise;
    newBlank.creationDate = Date.now();
    newBlank.isClosed = true;
    let expertise =  await getGroup({_id: groupExpertise})[0];
    newBlank.blank = {
        aim: expertise.template.aim,
        description: expertise.template.description,
        items: expertise.template.items,
        criteria: expertise.template.criteria
    }
    await newBlank.save((err, data) => {
        if (err) throw err;
        expertise.experts.push(userId);
        expertise.blanks.push(data._id);
        expertise.save();
    });
    return newBlank;
}

exports.updateBlankExp = async function (id, data) {
    await updateBlank(id, data);
}
exports.confirmBlankExp = async function (id) {
    let blank = await getBlank({_id: id});
    let obj = blank[0].toObject();
    delete obj._id;
    obj.isClosed = true;
    const newBlank = new Blank(obj);
    await newBlank.save()
}
exports.deleteBlankExp = async function (id) {
    await deleteBlank(id);
}

async function createBlank (data) {
    await Blank.create(data);
}

async function updateBlank(id, data) {
    await Blank.findByIdAndUpdate(id, data);
}

async function getBlank(data) {
    return Blank.find(data);
}

async function deleteBlank (id) {
    await Blank.findByIdAndDelete(id);
}

exports.getInvitations = async function (expertId) {
    console.log(await Invitations.find({target: expertId}))
    return await Invitations.find({target: expertId});
}

//-----Сервіс розрахунків-------

exports.calculateAHP = async function (data) {
    return await calculation(data);
}

exports.calculateGroupAhp = async function (id) {
    let group = await GroupExpertize.findById(id).populate('blanks');
    let multResult = {
        blanks: [],
        result: []
    };
    let result = await calculation(group.blanks[0].blank);
    multResult.result = result.rankedScores;
    multResult.blanks.push(result);
    for (let i = 1; i < group.blanks.length; i++) {
        result = await calculation(group.blanks[i].blank);
        multResult.result = arrayMultiply(multResult.result, result.rankedScores);
        multResult.blanks.push(result);
    }
    multResult.result = arraySqrt(multResult.result, group.blanks.length);
    group.result = {
        rankedScores: multResult.result
    };
    await updateGroup(id, group);
    return multResult.result;
}

async function calculation (data) {
    let ahpContext = new AHP();
    const ahpData = data;
    ahpContext.addItems(ahpData.items);
    ahpContext.addCriteria(ahpData.criteria);
    for (let i = 0; i < ahpData.criteriaItemRank.length; i++) {
        ahpContext.rankCriteriaItem(ahpData.criteria[i], ahpData.criteriaItemRank[i]);
    }
    ahpContext.rankCriteria(ahpData.criteriaRank);
    let output = await ahpContext.run();
    return output;
}

function arrayMultiply (a, b) {
    let c = [];
    for (let i=0; i<a.length;i++) {
        c.push(a[i]*b[i]);
    }
    return c;
}

function arraySqrt (a, n) {
    let c = [];
    for (let i=0; i<a.length;i++) {
        c.push(Math.pow(a[i], 1/n));
    }
    return c;
}

exports.updateUser = async function (data, id) {
    let user = await User.findById(id);
    data.email = user.email;
    data.phone = user.phone;
    await User.findByIdAndUpdate(id, data);
    return successMsg
}

exports.getUser = async function (id) {
    return User.findById(id)
}
