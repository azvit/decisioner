var express = require('express');
var router = express.Router();
const authenticate = require('../app/auth/authentication');
const accessControl = require("../app/auth/check-access");
let ac = accessControl.ac();
const AccessControlMiddleware = require('accesscontrol-middleware');
const accessControlMiddleware = new AccessControlMiddleware(ac);
const userController = require('../app/CRUD/user.controller')

router.put('/:userId', authenticate, accessControlMiddleware.check({
    resource: 'expert',
    action: 'update',
    checkOwnerShip: true,
    operands: [
        { source: 'user', key: 'id'},
        { source: 'params', key: 'userId'}
    ]
}), userController.updateUser)

router.post('/email/send', authenticate, userController.sendEmailConfirmation)
router.put('/email/confirm', authenticate, userController.confirmEmail)
router.get('/', authenticate, userController.getUser);
router.post('/password/send', userController.sendPasswordConfirmation);
router.put('/password/confirm', userController.confirmPassword);

module.exports = router;
