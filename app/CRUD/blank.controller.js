const crudService = require('./crud.service');
const successMsg = require('../Constants').SUCCESS_MESSAGE;

exports.getBlanks = async function (req, res, next) {
    try {
        let responce = await crudService.getBlankExp({});
        res.json(responce).status(200);
    } catch (e) {
        next(e)
    }
}

exports.getBlanksByExpert = async function (req, res, next) {
    try {
        let response = await crudService.getBlankExp({creator: req.params["expertId"]});
        res.json(response).status(200);
    } catch (e) {
        next(e)
    }
}

exports.createBlank = async function (req, res, next) {
    try {
        await crudService.createBlankExp(req.body, req.user.id, null, false);
        res.send(successMsg).status(200);
    } catch (e) {
        next(e)
    }
}

exports.confirmBlank = async function (req, res, next) {
    try {
        await crudService.confirmBlankExp(req.params["blankId"]);
        res.send(successMsg).status(200);
    } catch (e) {
        next(e)
    }
}

exports.updateBlank = async function (req, res, next) {
    try {
        await crudService.updateBlankExp(req.params["blankId"], req.body);
        res.send(successMsg).status(200);
    } catch (e) {
        next(e)
    }
}

exports.deleteBlank = async function (req, res, next) {
    try {
        await  crudService.deleteBlankExp(req.params["blankId"]);
        res.send(successMsg).status(200);
    } catch (e) {
        next(e)
    }
}

exports.extendBlankToGroupExpertize = async function (req, res, next) {
    try {
        await  crudService.createGroupFromBlank(req);
        res.send(successMsg).status(200);
    } catch (e) {
        next(e)
    }
}

exports.getInvitations = async function (req, res, next) {
    try {
        console.log(req.params["expertId"]);
        let response = await crudService.getInvitations(req.params["expertId"]);
        res.json(response).status(200);
    } catch(e) {
        next(e)
    }
}
