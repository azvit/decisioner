const express = require('express');
const router = express.Router();
const accessControl = require('../app/auth/check-access');
let ac = accessControl.ac();
const AccessControlMiddleware = require('accesscontrol-middleware');
const accessControlMiddleware = new AccessControlMiddleware(ac);
const authenticate = require('../app/auth/authentication');
const reqExpertizeController = require('../app/CRUD/req-expertise.controller');
// ----Заявки на груповую/командную експертизу-----
//Создать заявку +
router.post('/', authenticate, accessControlMiddleware.check({
    resource: 'req-expertise',
    action: 'create',
}), reqExpertizeController.createReqExpertise);
//Получить все заявки (для админа) +
router.get('/', authenticate, accessControlMiddleware.check({
    resource: 'req-expertise',
    action: 'read'
}), reqExpertizeController.getReqExpertise);
//Получить все заявки клиента (для клиента и админа) +
router.get('/:clientId', authenticate, accessControlMiddleware.check({
    resource: 'req-expertise',
    action: 'read',
    checkOwnerShip: true,
    operands: [
        { source: 'user', key: 'id'},
        { source: 'params', key: 'clientId'}
    ]
}), reqExpertizeController.getReqExpertiseByOwner);
//Обновить заявку (для клиента и админа) +
router.put('/:reqId', authenticate, accessControl.checkClientReq, accessControlMiddleware.check({
    resource: 'req-expertise',
    action: 'update',
    checkOwnerShip: true,
    operands: [
        { source: 'user', key: 'id'},
        { source: 'user', key: 'resource'}
    ]
}), reqExpertizeController.updateReqExpertise);
//Подтвердить заявку + Создать групповую экспертизу (для админа) +
router.put('/:reqId/validate', authenticate, accessControlMiddleware.check({
    resource: 'req-expertise',
    action: 'update'
}), reqExpertizeController.validateReqExpertise);
//Удалить заявку (для клиента и  админа) +
router.delete('/:reqId', authenticate, accessControl.checkClientReq, accessControlMiddleware.check({
    resource: 'req-expertise',
    action: 'delete',
    checkOwnerShip: true,
    operands: [
        { source: 'user', key: 'id'},
        { source: 'user', key: 'resource'}
    ]
}), reqExpertizeController.deleteReqExpertise);

module.exports = router;
