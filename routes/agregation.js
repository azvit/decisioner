const express = require('express');
const router = express.Router();
const accessControl = require('../app/auth/check-access');
const ahpController = require('../app/CRUD/ahp.controller');
let ac = accessControl.ac();
const AccessControlMiddleware = require('accesscontrol-middleware');
const accessControlMiddleware = new AccessControlMiddleware(ac);
const authenticate = require('../app/auth/authentication');
const agregationController = require('../app/aggregation/agregation.controller');

// ----Розрахунок-----
router.post('/ahp', authenticate, accessControlMiddleware.check({
    resource: 'aggregation',
    action: 'create'
}), ahpController.ahp);

router.get('/ahp/:groupId', authenticate, accessControlMiddleware.check({
    resource: 'aggregation',
    action: 'create'
}), agregationController.agregateAHP);

router.get('/:groupId', authenticate, accessControlMiddleware.check({
    resource: 'aggregation',
    action: 'create'
}), agregationController.agregate);

module.exports = router;
