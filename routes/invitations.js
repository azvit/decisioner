const express = require('express');
const router = express.Router();
const accessControl = require('../app/auth/check-access');
let ac = accessControl.ac();
const AccessControlMiddleware = require('accesscontrol-middleware');
const accessControlMiddleware = new AccessControlMiddleware(ac);
const authenticate = require('../app/auth/authentication');
const groupExpertiseController = require('../app/CRUD/group-expertise.controller');
const administrationController = require('../app/administration/administration.controller')

//відправити запрошення до експертизи
router.post('/invite', authenticate, groupExpertiseController.invite);
//прийняти запрошення
router.get('/accept/:id', authenticate, groupExpertiseController.acceptInvite);
router.get('/decline/:id', authenticate, groupExpertiseController.declineInvite);
//получити список експертів
router.get('/experts', authenticate, accessControlMiddleware.check({
    resource: 'expert',
    action: 'read'
}), administrationController.getExperts)
module.exports = router;
