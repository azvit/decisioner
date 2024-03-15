const administrationService = require('./administration.service');
const statusCodeService = require('../statusCode/statusCode.service');

exports.getBlanks = async function (req, res, next) {
    try {
        res.json(await administrationService.getBlanks(req.query.limit, req.query.skip, req.query.search, req.query.filter)).status(200);
    } catch (e) {
        next(e)
    }
}

exports.getExpertises = async function (req, res, next) {
    try {
        res.json(await administrationService.getExpertises(req.query.limit, req.query.skip, req.query.search, req.query.filter)).status(200);
    } catch (e) {
        next(e)
    }
}

exports.getExpertiseFull = async function (req, res, next) {
    try {
        res.json(await administrationService.getExpertiseFull(req.params["groupId"])).status(200);
    } catch (e) {
        next(e)
    }
}

exports.getExperts = async function (req, res, next) {
    try {
        res.json(await administrationService.getExperts(req.query.limit, req.query.skip, req.query.search, req.query.filter)).status(200);
    } catch (e) {
        next(e)
    }
}

exports.deleteUser = async function (req, res, next) {
    try {
        res.json(await administrationService.deleteUser(req.params["userId"]));
    } catch (e) {
        next(e)
    }
}

exports.changeRole = async function (req, res, next) {
    try {
        res.json(await administrationService.changeRole(req.params["userId"], req.body.role));
    } catch (e) {
        next(e)
    }
}

exports.updateUser = async function (req, res, next) {
    try {
        let result = await administrationService.updateUser(req.params["userId"], req.body);
        res.send(result).status(statusCodeService.defineStatusCode(result));
    } catch (e) {
        next(e)
    }
}
