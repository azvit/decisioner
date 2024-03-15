const express = require('express');
const router = express.Router();
const authentication = require('../../app/auth/authentication')
const ac = require('../../app/auth/check-access');
const AccessControlMiddleware = require('accesscontrol-middleware');
const accessControlMiddleware = new AccessControlMiddleware(ac);

const loginController = require('../../app/auth/login');

router.post("/signin", loginController.signIn);
//router.post("/signup/user", loginController.signUp);
router.post("/signup/admin", authentication,  accessControlMiddleware.check({
    resource: 'admin',
    action: 'create'
}), loginController.signUpAdmin);
router.post("/signup/expert", loginController.signUpExpert);
router.get('/signup/confirm', loginController.confirmSignUpExpert);

module.exports = router;
