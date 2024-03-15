const Superadmin = require('../../models/users/superadmin');
const Client = require('../../models/users/client');
const UnconfirmedUser = require('../../models/users/unconfirmedUser');
const User = require('../../models/users/user')
const Config = require('../../config/config');
const jwt = require("jsonwebtoken");
const sha256 = require("sha256");
const {randomBytes} = require('node:crypto');
const userCollections = Array.of(Superadmin, User, UnconfirmedUser);
const asyncHandler = require('express-async-handler');
const successMsg = require('../Constants').SUCCESS_MESSAGE;
const alreadyIsMsg = require('../Constants').ALREADY_IS_MESSAGE;
const signupConfirmService = require('../mailer/user-confirmation.service');
const date = require("moment");
const {ROLE} = require("../Constants");
const {PEPPER} = require('../Constants');
const roles = [ROLE.SUPERADMIN, ''];


/*exports.signUp = asyncHandler(async function (req, res, next) {
    try {
        const registrationData = req.body;
        let client = new Client({
            login: registrationData.login,
            password: registrationData.password,
            email: registrationData.email,
            name: registrationData.name
        });
        let newClient = await Client.create(client);
        res.send(successMsg);
    } catch (e) {
        next(e);
    }
})*/

exports.confirmSignUpExpert = asyncHandler(async function (req, res, next) {
    try {
        res.send(await signupConfirmService.confirmSignup(req.query.key));
    } catch (e) {
        next(e)
    }
})

exports.signUpExpert = asyncHandler(async function (req, res, next) {
    try {
        const registrationData = req.body;
        if (await checkLoginUnique(registrationData.login, 2)) {
            let salt = randomBytes(16); //NEED TO CLEAN DB
            req.body.password = sha256(PEPPER + req.body.password + salt);
            req.body.salt = salt;
            console.log(req.body);
            await signupConfirmService.sendConfirmation(req.body, res);
        } else {
            res.send(alreadyIsMsg).status(400);
        }
    } catch (e) {
        next(e);
    }
})
exports.signUpAdmin = asyncHandler(async function (req, res, next) {
    try {
        const registrationData = req.body;
        let salt = randomBytes(16); //NEED TO CLEAN DB
        registrationData.password = sha256(PEPPER + req.body.password + salt);
        registrationData.salt = salt;
        let admin = new User({
            login: registrationData.login,
            password: registrationData.password,
            //salt: registrationData.salt,
            email: registrationData.email,
            name: registrationData.name,
            role: 'admin',
            degree: '',
            academicStatus: '',
            direction: 'Адміністратор',
            activitySphere: 'Адміністратор'
        });

        let newAdmin = await User.create(admin);
        res.json(successMsg).status(200);
    } catch (e) {
        next(e);
    }
})
exports.signIn =  asyncHandler(async (req, res, next) => {
    try {
        const userCollectionNamesStartIndex = 0;
        const login = req.body.login;
        const password = req.body.password;
        await verifyApplicationUser(
            userCollectionNamesStartIndex,
            data = {login, password},
            res
        );
    } catch (err) {
        next(err)
    }
})

async function checkLoginUnique (login, count) {
    for (let i = 0; i < userCollections.length; i++) {
        let users = await userCollections[i].find({login: login})
        if (users.length !== 0) {
            return false
        }
    }
    return true;
}

function checkSuperRole (indexOfDB) {
    return roles[indexOfDB];
}

async function verifyApplicationUser(collectionNameId, data, res) {
    userCollections[collectionNameId].findOne({
        'login': data.login
        //'password': data.password //CUT
    },'-login +password +salt', async (err, user) => {
        try {
            if (user) {
                if (user.role === undefined) {
                    user.role = checkSuperRole(collectionNameId)
                }
                data.password = sha256(PEPPER + data.password + user.salt);
                console.log(data.password);
                console.log(user);
                if (user.password === data.password) {
                    //token generate here
                    let token = jwt.sign({id: user.id, role: user.role}, Config.secretKey, {
                        expiresIn: 3600 * 24
                    });
                    console.log('token = ' + token)
                    res.status(200).json({
                        token: token,
                        expiresIn: 3600 * 24,
                        role: user.role,
                        user: user
                    });
                } else {
                    res.status(400).json({
                        message: 'Wrong login or password',
                        result: 'error'
                    });
                }

            } else {
                if (collectionNameId === userCollections.length - 1) {
                    res.status(400).json({
                        message: 'Wrong login or password',
                        result: 'error'
                    });
                    return;
                }
                await verifyApplicationUser(collectionNameId + 1, data, res);
            }
        } catch (e) {
            res.status(400).json({
                message: 'Wrong login or password',
                result: 'error'
            });
        }
    })
}

