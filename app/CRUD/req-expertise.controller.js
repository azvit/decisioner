const ahpServices = require('./crud.service');
const successMsg = require('../Constants').SUCCESS_MESSAGE;

exports.createReqExpertise = async function (req, res, next) {
    try {
        req.body.creationDate = Date.now();
        await ahpServices.createRequest(req);
        res.send(successMsg).status(200);
    } catch (e) {
        next(e)
    }
}

exports.getReqExpertiseByOwner = async function (req, res, next) { //получить все заявки для клиента
    try {
        let response = await ahpServices.getReqExp({client: req.params["clientId"]})
        res.json(response).status(200);
    } catch (e) {
        next(e)
    }
}

exports.getReqExpertise = async function (req, res, next) { //получить все заявки (для админа)
    try {
        let response = await ahpServices.getReqExp({});
        res.json(response).status(200)
    } catch (e) {
        next(e)
    }
}

exports.updateReqExpertise = async function (req, res, next) {
    try {
        await ahpServices.updateRequest(req.params["reqId"], req.body);
        res.send(successMsg).status(200);
    } catch (e) {
        next(e)
    }
}

exports.validateReqExpertise = async function (req, res, next) {
    try {
        await ahpServices.validateReq(req.params["reqId"], req.user.id);
        res.send(successMsg).status(200);
    } catch (e) {
        next(e)
    }
}

exports.deleteReqExpertise = async function (req, res, next) {
    try {
        await ahpServices.deleteRequest(req.params["reqId"]);
        res.send(successMsg).status(200);
    } catch (e) {
        next(e)
    }
}

