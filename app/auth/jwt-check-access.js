const jwt = require('jsonwebtoken')
const Config = require('../../config/config')
const util = require('util');

exports.getIDFromToken = async function (token) {
    let decodedToken = await getDecodedToken(token);
    return decodedToken.id;
}

exports.getIdAndRoleFromToken = async function (token) {
    let decodedToken = await getDecodedToken(token);
    return {id: decodedToken.id, role: decodedToken.role};
}

exports.checkAdmin = async function (req, res, next) {
    const token = req.headers.authorization;
    let decodedToken = await getDecodedToken(token);
    if (decodedToken.role !== 'admin') {
        res.status(401);
    };
    next();
}

getDecodedToken = async function(token) {
    let decodedToken;
    token = token.split(' ')[1];
    let jwtVerityPromise = util.promisify(jwt.verify);
    decodedToken = await jwtVerityPromise(token, Config.secretKey);
    return decodedToken;
}

