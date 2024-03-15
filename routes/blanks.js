const express = require('express');
const router = express.Router();
const accessControl = require('../app/auth/check-access');
let ac = accessControl.ac();
const AccessControlMiddleware = require('accesscontrol-middleware');
const accessControlMiddleware = new AccessControlMiddleware(ac);
const authenticate = require('../app/auth/authentication');
const blankController = require('../app/CRUD/blank.controller');
const ahpController = require('../app/CRUD/ahp.controller');

//------Бланки експертов--------
//Получить все бланки (для админа) +
router.get('/', authenticate, accessControlMiddleware.check({
    resource: 'blank',
    action: 'create'
}), blankController.getBlanks);
//Получить бланки експерта (для експерта и админа) +
router.get('/:expertId', authenticate, accessControlMiddleware.check({
    resource: 'blank',
    action: 'create',
    checkOwnerShip: true,
    operands:  [
        { source: 'user', key: 'id'},
        { source: 'params', key: 'expertId'}
    ]
}), blankController.getBlanksByExpert);
router.get('/invitations/:expertId', authenticate, blankController.getInvitations);
//Сохранить бланк +
router.post('/:creatorId', authenticate, accessControlMiddleware.check({
    resource: 'blank',
    action: 'create',
    checkOwnerShip: true,
    operands: [
        { source: 'user', key: 'id'},
        { source: 'params', key: 'creatorId'}
    ]
}), blankController.createBlank);
//Изменить бланк +
router.put('/:blankId', authenticate, accessControl.checkBlank, accessControlMiddleware.check({
    resource: 'blank',
    action: 'update',
    checkOwnerShip: true,
    operands: [
        { source: 'user', key: 'id'},
        { source: 'user', key: 'resource'}
    ]
}), blankController.updateBlank);
router.put('/confirm/:blankId', authenticate, accessControl.checkBlank, accessControlMiddleware.check({
    resource: 'blank',
    action: 'update',
    checkOwnerShip: true,
    operands: [
        { source: 'user', key: 'id'},
        { source: 'user', key: 'resource'}
    ]
}), blankController.confirmBlank);
//превратить бланк в групповую експертизу +
router.put('/:blankId/extend', authenticate, accessControl.checkBlank, accessControlMiddleware.check({
    resource: 'group-expertise',
    action: 'create',
    checkOwnerShip: true,
    operands: [
        { source: 'user', key: 'id'},
        { source: 'user', key: 'resource'}
    ]
}), blankController.extendBlankToGroupExpertize);
//Удалить бланк +
router.delete('/:blankId', authenticate, accessControl.checkBlank, accessControlMiddleware.check({
    resource: 'blank',
    action: 'update',
    checkOwnerShip: true,
    operands: [
        { source: 'user', key: 'id'},
        { source: 'user', key: 'resource'}
    ]
}), blankController.deleteBlank);

router.get('/:blankId/calculate', authenticate, accessControl.checkBlank, accessControlMiddleware.check({
    resource: 'blank',
    action: 'update',
    checkOwnerShip: true,
    operands: [
        { source: 'user', key: 'id'},
        { source: 'user', key: 'resource'}
    ]
}), ahpController.ahpBlank)
module.exports = router;
