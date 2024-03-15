const {AccessControl} = require("accesscontrol");
const ahpServices = require('../CRUD/crud.service');
const ReqExpertize = require('../../models/entities/req-expertize');
const Users = require("../../models/users/user");
const forbiddenMsg = require('../Constants').FORBIDDEN_MESSAGE;
const errMsg = require('../Constants').NOT_FOUND_MESSAGE
const ac = new AccessControl();
ac.grant('superadmin')
        .createAny('admin') // керування адмінами
        .updateAny('admin')
        .readAny('admin')
        .deleteAny('admin')
        .updateAny('role')
    .grant('admin')  // БОГ
        .updateAny('role')
        .readAny('group-expertise') //керування груопвими експертизами
        .createAny('group-expertise')
        .updateAny('group-expertise')
        .deleteAny('group-expertise')
        .readAny('expert')    // керування експертами
        .createAny('expert')
        .updateAny('expert')
        .deleteAny('expert')
        .createAny('aggregation')  // зробити агрегацію
        .readAny('team-expertise-result') // получити результат експертизи
        .createAny('team-expertise-result')
        .updateAny('team-expertise-result')
        .deleteAny('team-expertise-result')
        .readAny('group-expertise-result')
        .readAny('req-expertise')
        .createAny('req-expertise')
        .updateAny('req-expertise')
        .deleteAny('req-expertise')
        .readAny('blank') // керування особистим бланком експертизи
        .createAny('blank')
        .updateAny('blank')
        .deleteAny('blank')
    .grant('moderator')
        .readOwn('group-expertise') //керування груопвими експертизами
        .createAny('group-expertise')
        .updateOwn('group-expertise')
        .deleteOwn('group-expertise')
        .readAny('expert')    // керування експертами
        .createAny('aggregation')  // зробити агрегацію
        .readOwn('group-expertise-result')
        .readAny('req-expertise')
        .createAny('req-expertise')
        .updateAny('req-expertise')
        .deleteAny('req-expertise')
        .readAny('blank') // керування особистим бланком експертизи
        .createAny('blank')
        .updateAny('blank')
        .deleteAny('blank')
    .grant('expert')
        .updateOwn('expert')
        .readOwn('expertise-invitation') // керування особистим інвайтом на участь у експертизі
        .updateOwn('expertise-invitation')
        .deleteOwn('expertise-invitation')
        .readOwn('blank') // керування особистим бланком експертизи
        .createOwn('blank')
        .updateOwn('blank')
        .deleteOwn('blank')
        .createOwn('aggregation') // зробити агрегацію
        .readOwn('team-expertise-result')   // добавть груповой результат всемучастникам
        .readOwn('group-expertise-result')
        .readOwn('group-expertise') //керування груопвими експертизами
        .createOwn('group-expertise')
        .updateOwn('group-expertise')
        .deleteOwn('group-expertise')
    .grant('client')
        .readOwn('expertise-result')
        .readOwn('req-expertise')
        .createOwn('req-expertise')
        .updateOwn('req-expertise')
        .deleteOwn('req-expertise')
        .readOwn('req-team-expertise')
        .createOwn('req-team-expertise')
        .updateOwn('req-team-expertise')
        .deleteOwn('req-team-expertise')
; // получити результат експертизи

// керування своими заявками на групповую/командную експертизу
exports.ac = function () {
    return  ac;
}

exports.checkGroup = async function (req, res, next) {
    try {
        const groupId = req.params["groupId"];
        let group = await ahpServices.getGroupExp({_id: groupId});
        req.user.resource = group[0].creator;
        next()
    } catch {
        res.statusCode = 400;
        res.send(errMsg);
    }
}

function sortExperts (data, id) {
    data.sort(function (a) {
        if (a.indexOf(id) > -1) {
            return -1
        }
        return 1
    });
    return data[0];
}

exports.checkBlankToAddToGroup = async function (req, res, next) {
    try {
        let group = await ahpServices.getGroupExp({_id: req.params["groupId"]});
        let blank = await ahpServices.getBlankExp({_id: req.query.blankId});
        if (group[0].template.items.toString() === blank[0].blank.items.toString() && group[0].template.criteria.toString() === blank[0].blank.criteria.toString()) {
            req.user.groupId = sortExperts(group[0].experts, req.user.id);
            req.user.blankId = blank[0].creator;
            next()
        } else {
            res.send({message: 'Does not match template!'}).status(400);
        }
    } catch {
        res.statusCode = 400;
        res.send(errMsg);
    }
}

exports.checkAccessToGroupExpertize = async function (req, res, next) {
    try {
        const groupId = req.params["groupId"];
        let groupExp = await ahpServices.getGroupExp({_id: groupId});
        console.log(groupExp);
        req.user.resource = groupExp[0].creator;
        next();
    } catch {
        res.statusCode = 400;
        res.send(errMsg);
    }
}

exports.checkClientReq = async function (req, res, next){
    try {
        const reqId = req.params["reqId"];
        const reqExpertize = await ReqExpertize.findById(reqId);
        req.user.resource = reqExpertize.client;
        next();
    } catch {
        res.statusCode = 400;
        res.send(errMsg);
    }
}

exports.checkBlank = async function (req, res, next) {
    try {
        const blankId = req.params["blankId"];
        let blank = await ahpServices.getBlankExp({_id: blankId});
        req.user.resource = blank[0].creator;
        next();
    } catch {
        res.statusCode = 400;
        res.send(errMsg);
    }
}

exports.checkUserRole = function (req, res, next) {
    try {
        if (req.body.role !== 'superadmin' || 'admin') {
            next()
        } else {
            res.statusCode = 403
            res.send(forbiddenMsg);
        }
    } catch {
        res.statusCode = 400;
        res.send(errMsg);
    }
}

exports.deleteUserCheck = async function (req, res, next) {
    try {
        const removingUserId = req.params["userId"];
        const removerRole = req.user.role;
        let removingUser = await Users.findById(removingUserId);
        if ((removingUser.role !== 'admin') && (removerRole === 'admin' || 'superadmin')) {
            next()
        } else {
            res.statusCode = 403
            res.send(forbiddenMsg);
        }
    } catch {
        res.statusCode = 400;
        res.send(errMsg);
    }
}
