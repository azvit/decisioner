
const ahpServices = require('./crud.service');

exports.ahpGroup = async function (req, res, next) {
    try {
        let result = await ahpServices.calculateGroupAhp(req.params["groupId"]);
        res.json(result).status(200);
    } catch (e) {
        next(e)
    }
}

exports.ahp = async function (req, res, next) {
    try {
        let result = await ahpServices.calculateAHP(req.body);
        res.json(result).status(200);
    } catch (e) {
        next(e)
    }
}

exports.ahpBlank = async function (req, res, next) {
    try {
        let blank = await ahpServices.getBlankExp({_id: req.params["blankId"]});
        let result = await ahpServices.calculateAHP(blank[0].blank);
        await ahpServices.updateBlankExp(req.params["blankId"], {result: result});
        res.json(result).status(200);
    } catch (e) {
        next(e)
    }
}
