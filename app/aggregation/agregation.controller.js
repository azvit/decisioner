const agregationService = require('./agregation.service');

exports.agregateAHP = async function (req, res, next) {
    try {
        res.json(await agregationService.agregate(req.params["groupId"], undefined, false)).status(200);
    } catch (e) {
        next(e)
    }
}

exports.agregate = async function (req, res, next) {
    try {
        res.json(await agregationService.agregate(req.params["groupId"], req.query.expertsWeight)).status(200);
    } catch (e) {
        next(e)
    }
}
