const express = require('express');
const router = express.Router();
const accessControl = require('../app/auth/check-access');
let ac = accessControl.ac();
const AccessControlMiddleware = require('accesscontrol-middleware');
const accessControlMiddleware = new AccessControlMiddleware(ac);
const authenticate = require('../app/auth/authentication');
const administrationController = require('../app/administration/administration.controller')

router.get('/blanks', authenticate, accessControlMiddleware.check({
    resource: 'blank',
    action: 'read'
}), administrationController.getBlanks)

router.get('/group-expertises', authenticate, accessControlMiddleware.check({
    resource: 'group-expertise',
    action: 'read'
}))

router.get('/group-expertise/:groupId', authenticate, accessControlMiddleware.check({
    resource: 'group-expertise',
    action: 'read'
}), administrationController.getExpertiseFull)

router.delete('/users/:userId', authenticate, accessControl.deleteUserCheck, administrationController.deleteUser);

router.put('/users/:userId/role', authenticate, accessControlMiddleware.check({
    resource: 'role',
    action: 'update'
}), accessControl.checkUserRole, administrationController.changeRole);

router.put('/users/:userId', authenticate, accessControlMiddleware.check({
    resource: 'expert',
    action: 'update'
}), administrationController.updateUser)

module.exports = router
