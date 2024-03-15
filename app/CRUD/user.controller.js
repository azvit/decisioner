const User = require('../../models/users/user');
const crudService = require('./crud.service');
const successMsg = require('../Constants').SUCCESS_MESSAGE;
const userConfirmationService = require('../mailer/user-confirmation.service');
const statusCodeService = require('../statusCode/statusCode.service');
const createError = require('http-errors');

exports.updateUser = async function (req, res, next) {
    try {
        let result = await crudService.updateUser(req.body, req.params["userId"]);
        res.send(result).status(statusCodeService.defineStatusCode(result));
    } catch (e) {
        next(e)
    }
}

exports.sendEmailConfirmation = async function (req, res, next) {
    try {
       let result = await userConfirmationService.sendEmailResetConfirmation(req.user.id, req.body.email, res);
       res.send(result).status(statusCodeService.defineStatusCode(result));
    } catch (e) {
        next(e);
    }
}

exports.confirmEmail = async function (req, res, next) {
    try {
        let result = await userConfirmationService.confirmResetEmail(req.user.id, req.query.key);
        res.json(result).status(statusCodeService.defineStatusCode(result.message));
    } catch (e) {
        next(e)
    }
}

exports.getUser = async function (req, res, next) {
    try {
        res.json(await crudService.getUser(req.user.id));
    } catch (e) {
        next(e)
    }
}

exports.sendPasswordConfirmation = async function (req, res, next) {
    try {
        let result = await userConfirmationService.sendPasswordConfirmation(req.body.password, req.body.email, res);
        res.send(result).status(statusCodeService.defineStatusCode(result));
    } catch (e) {
        next(e)
    }
}

exports.confirmPassword = async function (req, res, next) {
    try {
        let result = await userConfirmationService.confirmChangePassword(req.query.key);
        res.send(result).status(statusCodeService.defineStatusCode(result))
    } catch (e) {
        next(e)
    }
}
