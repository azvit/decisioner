const express = require('express');
const router = express.Router();
const accessControl = require('../app/auth/check-access');
let ac = accessControl.ac();
const AccessControlMiddleware = require('accesscontrol-middleware');
const accessControlMiddleware = new AccessControlMiddleware(ac);
const authenticate = require('../app/auth/authentication');
const ahpController = require('../app/CRUD/ahp.controller');
const groupExpertiseController = require('../app/CRUD/group-expertise.controller');

// ----Групова екпертиза-----
//Получить все експертизы (для админа) +
router.get('/', authenticate, accessControlMiddleware.check({
    resource: 'group-expertise',
    action: 'read'
}), groupExpertiseController.getGroupExpertises);

//Получить все експертизы для експерта (для експерта и админа) +
router.get('/:expertId', authenticate, accessControlMiddleware.check({
    resource: 'group-expertise',
    action: 'read',
    checkOwnerShip: true,
    operands: [
        { source: 'user', key: 'id'},
        { source: 'params', key: 'expertId'}
    ]
}), groupExpertiseController.getExpertisesForExpert);

//Создать експертизу (для админа) +
router.post('/', authenticate, accessControlMiddleware.check({
    resource: 'group-expertise',
    action: 'create'
}), groupExpertiseController.createGroupExpertize);

//Обновить експертизу (для админа и експерта-создателя) +
router.put('/:groupId', authenticate, accessControl.checkAccessToGroupExpertize, accessControlMiddleware.check({
    resource: 'group-expertise',
    action: 'update',
    checkOwnerShip: true,
    operands: [
        { source: 'user', key: 'id'},
        { source: 'user', key: 'resource'}
    ]
}), groupExpertiseController.updateGroupExpertize);

router.put('/confirm/:groupId', authenticate, accessControl.checkAccessToGroupExpertize, accessControlMiddleware.check({
    resource: 'group-expertise',
    action: 'update',
    checkOwnerShip: true,
    operands: [
        { source: 'user', key: 'id'},
        { source: 'user', key: 'resource'}
    ]
}), groupExpertiseController.confirmGroupExpertise);

//Добавить експерта в группу (для админа  и експерта-создателя)
router.put('/:groupId/expert', authenticate, accessControl.checkAccessToGroupExpertize, accessControlMiddleware.check({
    resource: 'group-expertise',
    action: 'update',
    checkOwnerShip: true,
    operands: [
        { source: 'user', key: 'id'},
        { source: 'user', key: 'resource'}
    ]
}), groupExpertiseController.addExpertToGroup);

//Отправить бланк експерта в експертизу (для експерта) +
/*router.put('/:groupId/blank', authenticate, accessControl.checkAccessToGroupExpertize, accessControlMiddleware.check({
    resource: 'group-expertise',
    action: 'update',
    checkOwnerShip: true,
    operands: [
        { source: 'user', key: 'resource'},
        { source: 'params', key: 'groupId'}
    ]
}), groupExpertiseController.addCreatorsBlank);*/

//Удалить експертизу (для админа) +
router.delete('/:groupId', authenticate, accessControl.checkAccessToGroupExpertize, accessControlMiddleware.check({
    resource: 'group-expertise',
    action: 'delete',
    checkOwnerShip: true,
    operands: [
        { source: 'user', key: 'resource'},
        { source: 'user', key: 'id'}
    ]
}), groupExpertiseController.deleteGroupExpertize);


module.exports = router;
