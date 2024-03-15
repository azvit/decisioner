const nodemailer = require('nodejs-nodemailer-outlook');
const Invitations = require('../../models/keys/invitation');
const keygen = require('keygen');
const {METHODS} = require("../Constants");
const ahpServices = require('../CRUD/crud.service');
const Blank = require('../../models/entities/blank');
const mongoose = require('mongoose');
const alreadyIsMsg = require('../Constants').ALREADY_IS_MESSAGE;
const successMsg = require('../Constants').SUCCESS_MESSAGE;
const errorMsg = require('../Constants').ERROR_MESSAGE
const notFoundMsg = require('../Constants').NOT_FOUND_MESSAGE;
const notExistMsg = require('../Constants').NOT_EXIST_MESSAGE;
const GroupExpertize = require('../../models/entities/group-experise');
const Experts = require('../../models/users/expert');
const User = require('../../models/users/user');
const {SUCCESS_MESSAGE} = require("../Constants");
const {ERROR_MESSAGE} = require("../Constants");

exports.sendInvitation = async function (senderName, creatorId, expertiseId, expertId, res) {
    let expert = await User.findById(expertId);
    let groupExpertise = await GroupExpertize.findById(expertiseId).populate('experts');
    if (groupExpertise.populated('experts')) {
        if ((groupExpertise.experts.toString().indexOf(expertId) !== -1) || (groupExpertise.invitedExperts.toString().indexOf(expertId) !== -1)) {
            return alreadyIsMsg;
        } else {
           await confirm(expert.email, expert.name, senderName, groupExpertise.name, creatorId, expertiseId, expertId, res)
        }
    } else {
        await confirm(expert.email, expert.name, senderName, groupExpertise.name, creatorId, expertiseId, expertId, res)
    }
}

exports.acceptInvitation = async function (id, userId) {
    let invitation = await Invitations.findById(id).populate('expertise');
    console.log(await invitation)
    if (invitation === undefined) {
        return notExistMsg;
    }
    invitation.expertise.experts.push(userId);
    let blank = new Blank;
        blank.creator = userId;
        blank.groupExpertise = invitation.expertise._id;
        blank.isClosed = true;
        blank.name = invitation.expertise.name;
        blank.method = invitation.expertise.template.method;
        blank.creationDate = Date.now();
        blank.blank = {
            aim: invitation.expertise.template.aim,
            description: invitation.expertise.template.description,
            items: invitation.expertise.template.items,
            itemsDescription: invitation.expertise.template.itemsDescription,
            criteria: invitation.expertise.template.criteria,
            criteriaDescription: invitation.expertise.template.criteriaDescription,
            criteriaRank: [],
            criteriaItemRank: []
        }
        let criteriaRank = [];
        let itemRank = [];
        switch(blank.method) {

            case METHODS.AHP: {
                for (let i = 0; i < blank.blank.criteria.length; i++) {
                    for (let j = i + 1; j < blank.blank.criteria.length; j++) {
                        criteriaRank.push([blank.blank.criteria[i], blank.blank.criteria[j], 1]);
                    }
                    itemRank.push([]);
                    for (let j = 0; j < blank.blank.items.length; j++) {
                        for (let q = j + 1; q < blank.blank.items.length; q++) {
                            itemRank[i].push([blank.blank.items[j], blank.blank.items[q], 1]);
                        }
                    }
                }
                blank.blank.criteriaRank = criteriaRank;
                blank.blank.criteriaItemRank = itemRank;
                break;
            }
            case METHODS.NORM: {
                for (let i = 0; i < blank.blank.criteria.length; i++) {
                    criteriaRank.push(1);
                }
                for (let i = 0; i < blank.blank.items.length; i++) {
                    itemRank.push([]);
                    for (let j = 0; j < blank.blank.criteria.length; j++) {
                        itemRank[i].push(1)
                    }
                }
                console.log(criteriaRank);
                console.log(itemRank);
                blank.blank.criteriaRank = criteriaRank;
                blank.blank.criteriaItemRank = itemRank;
                break;
            }
            case METHODS.RANGE: {
                let rankedScores = []
                for (let i = 0; i < blank.blank.items.length; i++) {
                    itemRank.push([]);
                    criteriaRank.push(0);
                    for (let j = 0; j < blank.blank.items.length; j++) {
                        if (i === j) {
                            itemRank[i].push('-')
                        } else {
                            itemRank[i].push(0.5);
                        }
                    }
                    rankedScores.push(0)
                }
                blank.blank.criteriaItemRank = itemRank;
                break
            }
    
        }

        /*let result = [];
        let score = 1/blank.blank.items.length;
        for (let i = 0; i < blank.blank.items.length; i++) {
            result.push(score);
        }
        blank.result = {
            rankedScores: result
        }*/
    //await ahpServices.createBlankExp(blank, userId, invitation[0].expertise._id, true);
    await blank.save(async (err, blank) => {
        if (err) return errorMsg;
        await ahpServices.updateGroupExpertize(invitation.expertise._id, {
            $push: {
                blanks: blank._id,
                experts: userId
            },
            $pullAll: {
                invitedExperts: [userId]
            }
        });
        await User.findByIdAndUpdate(userId, {$push: {expertiseHistory: invitation.expertise.name}})
    })
    await Invitations.findByIdAndDelete(id);
    return SUCCESS_MESSAGE;
}

exports.declineInvitation = async function (id) {
    Invitations.findByIdAndDelete(id);
    return SUCCESS_MESSAGE;
}

async function confirm (email, name, senderName, expertiseName, creatorId, expertiseId, expertId, res) {
    let key = keygen.url();
    await Invitations.create({creator: creatorId, expertise: expertiseId, expertiseName: expertiseName, target: expertId, key: key})
            await ahpServices.updateGroupExpertize(expertiseId, {$push: {invitedExperts: expertId}}).then(() => {
                res.send(SUCCESS_MESSAGE);
            });
    /*nodemailer.sendEmail({
        auth: {
            user: process.env.EMAIL_BOT_USERNAME,
            pass: process.env.EMAIL_BOT_PASSWORD
        },
        from: process.env.EMAIL_BOT_USERNAME,
        to: email,
        subject: 'Запрошення на групову експертизу',
        text:  name + '! ' + senderName + ' запросив Вас на групову експертизу "' + expertiseName + '". Перейдіть по лінку, якщо ви згодні прийняти участь. https://frozen-ocean-01944.herokuapp.com/group-expertise/invitation?key=' + key,
        onError: (e) =>{console.log(e); res.send(ERROR_MESSAGE)},
        onSuccess: async (i) => {
            //res.send(SUCCESS_MESSAGE);
            console.log(i)
            await Invitations.create({creator: creatorId, expertise: expertiseId, target: expertId, key: key})
            await ahpServices.updateGroupExpertize(expertiseId, {$push: {invitedExperts: expertId}}).then(() => {
                res.send(SUCCESS_MESSAGE);
            });
        }
    })*/




}

