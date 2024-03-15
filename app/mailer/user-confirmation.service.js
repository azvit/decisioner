const nodemailer = require('nodejs-nodemailer-outlook');
const keygen = require('keygen');
const UnconfirmedUser = require('../../models/users/unconfirmedUser')
const Expert = require('../../models/users/expert');
const User = require('../../models/users/user');
const successMsg = require('../Constants').SUCCESS_MESSAGE;
const errorMsg = require('../Constants').ERROR_MESSAGE;
const notFoundMsg = require('../Constants').NOT_FOUND_MESSAGE;
const notExistMsg = require('../Constants').NOT_EXIST_MESSAGE;
const alreadyIsMsg = require('../Constants').ALREADY_IS_MESSAGE;
const EmailKey = require('../../models/keys/emailKey');
const PasswordKey = require('../../models/keys/passwordKey');
const sha256 = require("sha256");
const {ERROR_MESSAGE} = require("../Constants");
const {SUCCESS_MESSAGE} = require("../Constants");
const {NOT_FOUND_MESSAGE} = require("../Constants");
const {randomBytes} = require('node:crypto');
const {PEPPER} = require('../Constants');

exports.sendConfirmation = async function (regData, res) {
    regData.key = keygen.url();
    await UnconfirmedUser.create(regData);
    let message = 'Перейдіть по лінку для підтвердження вашої реєстрації у системі "Decisioner": https://frozen-ocean-01944.herokuapp.com/signup/confirm?key=' + regData.key;
    let title = 'Підтвердження реєстрації';
    await sendMail(regData.name, regData.email, message, title, res);
}

exports.confirmSignup = async function (key) {
    let user = await UnconfirmedUser.findOne({key: key});
    if (user) {
        console.log(user)
        user._id = '';
        await User.create({
            login: user.login,
            password: user.password,
            email: user.email,
            phone: user.phone,
            name: user.name,
            role: 'expert',
            degree: user.degree,
            academicStatus: user.academicStatus,
            expertiseHistory: [],
            salt: user.salt,
            direction: user.direction,
            activitySphere: user.activitySphere
        });
        await UnconfirmedUser.findByIdAndDelete(user._id);
        return successMsg;
    }
    return notFoundMsg
}

exports.sendEmailResetConfirmation = async function (userId, newEmail, res) {
    let key = keygen.url();
    let user = User.findById(userId);
    await EmailKey.create({user: userId, email: newEmail, key: key});
    let message = 'Перейдіть по лінку для підтвердження зміни вашої е-пошти у системі "Decisioner": https://frozen-ocean-01944.herokuapp.com/account/confirm-email?key=' + key;
    let title = 'Підтвердження зміни е-пошти';
    return await sendMail(user.name, newEmail, message, title, res);
}

exports.confirmResetEmail = async function (userId, key) {
    let emailKey = await EmailKey.findOne({user: userId, key: key})
    if (emailKey) {
        await User.findByIdAndUpdate(userId, {email: emailKey.email});
        await EmailKey.findByIdAndDelete(emailKey._id);
        return {message: successMsg, email: emailKey.email}
    } else {
        return {message: notExistMsg}
    }
}

exports.sendPasswordConfirmation = async function (password, email, res) {
    let user = await User.find({email: email});
    if (user === undefined || user.length === 0) {
        return NOT_FOUND_MESSAGE;
    }
    let pass = sha256(PEPPER + password + user[0].salt);
    if (user[0].password === password) {
        return alreadyIsMsg
    }
    let key = keygen.url();
    let salt = randomBytes(16);
    pass = sha256(PEPPER + password + salt);
    await PasswordKey.create({user: user[0]._id, password: pass, salt: salt, key: key}, (err) => {
        if (err) throw err;
    });
    let message = 'Перейдіть по лінку для підтвердження зміни вашого паролю у системі "Decisioner": https://frozen-ocean-01944.herokuapp.com/change-password/confirm?key=' + key;
    let title = 'Підтвердження зміни паролю';
    return await sendMail(user[0].name, user[0].email, message, title, res);
}

exports.confirmChangePassword = async function (key) {
    let passwordKey = await PasswordKey.findOne({key: key});
    if (passwordKey) {
        await User.findByIdAndUpdate(passwordKey.user, {password: passwordKey.password, salt: passwordKey.salt});
        await PasswordKey.findByIdAndDelete(passwordKey._id);
        return successMsg;
    } else {
        return notExistMsg;
    }
}

async function sendMail (userName, email, message, title, res) {
    nodemailer.sendEmail({
        auth: {
            user: process.env.EMAIL_BOT_USERNAME,
            pass: process.env.EMAIL_BOT_PASSWORD
        },
        from: process.env.EMAIL_BOT_USERNAME,
        to: email,
        subject: title,
        text:  userName + '! ' + message,
        onError: (e) =>{console.log(e); res.send(ERROR_MESSAGE)} ,
        onSuccess: (i) => {console.log('success!' + i); res.send(SUCCESS_MESSAGE)}
    })
}
