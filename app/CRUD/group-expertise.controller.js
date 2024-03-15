const crudService = require('./crud.service');
const successMsg = require('../Constants').SUCCESS_MESSAGE;
const invitationServices = require('../mailer/invitations.service');
const statucCodeService = require('../statusCode/statusCode.service');

exports.getGroupExpertises = async function (req, res, next) {
    try {
        let response = await crudService.getGroupExp({});
        res.json(response).status(200);
    } catch (e) {
        next(e)
    }
}

exports.getExpertisesForExpert = async function (req, res, next) {
    try {
        let response = await crudService.getGroupExp({creator: req.params["expertId"]});
        res.json(response).status(200);
    } catch (e) {
        next(e)
    }
}

exports.getExpertisesWithExpert = async function (req, res, next) {
    try {
        let response = await crudService.getGroupExp({experts: { $in: [req.params["expertId"]]}});
        res.json(response).status(200);
    } catch (e) {
        next(e)
    }
}

exports.createGroupExpertize = async function (req, res, next) {
    try {
        await crudService.createGroupExpertize(req.body, req.user.id);
        res.send(successMsg).status(200);
    } catch (e) {
        next(e)
    }
}

exports.updateGroupExpertize = async function (req, res, next) {
    try {
        await crudService.updateGroupExpertize(req.params["groupId"], req.body);
        res.send(successMsg).status(200);
    } catch (e) {
        next(e)
    }
}

exports.confirmGroupExpertise = async function (req, res, next) {
    try {
        await crudService.confirmGroupExp(req.params["groupId"]);
        res.send(successMsg).status(200);
    } catch (e) {
        next(e)
    }
}

exports.addExpertToGroup = async function (req, res, next) {
    try {
        await crudService.updateGroupExpertize(req.params["groupId"], {$push: {experts: req.query.expertId}});
        res.send(successMsg).status(200);
    } catch (e) {
        next(e)
    }
}

exports.deleteGroupExpertize = async function (req, res, next) {
    try {
        await crudService.deleteGroupExpertize(req.params["groupId"])
        res.send(successMsg).status(200);
    } catch (e) {
        next(e)
    }
}

exports.addBlankToGroupExpertize = async function (req, res, next) {
    try {
        await crudService.addBlankToGroup(req, {$push: {blanks: req.query.blankId}});
        res.send(successMsg).status(200);
    } catch (e) {
        next(e)
    }
}

exports.blockGroupExpertise = async function (req, res, next) {
    try {
        await crudService.updateGroupExpertize(req.params["groupId"], {isClosed: true});
        res.json(successMsg).status(200);
    } catch (e) {
        next(e);
    }
}

/*exports.addCreatorsBlank = async function (req, res, next) {
    try {
        let expertise = await crudService.getGroupExp({_id: req.params["groupId"]})[0];
        await crudService.createBlankExp(req.body, req.user.id, expertise._id, true);
        res.json(successMsg).status(200);
    } catch (e) {
        next(e)
    }
}*/

exports.invite = async function (req, res, next) {
    try {
        await invitationServices.sendInvitation(
            req.body.senderName,
            req.user.id,
            req.body.expertiseId,
            req.body.expertId,
            res);
    } catch (e) {
        next(e)
    }
}

exports.acceptInvite = async function (req, res, next) {
    try {
        let msg = await invitationServices.acceptInvitation(req.params["id"], req.user.id);
        res.json(msg);
    } catch (e) {
        next(e);
    }
}

exports.declineInvite = async function (req, res, next) {
    try {
        let msg = await invitationServices.declineInvitation(req.params["id"])
        res.json(msg)
    } catch (e) {
        next(e)
    }
}

