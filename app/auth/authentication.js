const Config = require('../../config/config')
const jwt = require("jsonwebtoken");

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, Config.secretKey, (err, user) => {
            if (err) {
                res.statusCode = 403;
                return res.send({message: 'Not authorized!'});
            }
            req.user = user;
            next();
        });
    } else {
        res.statusCode = 403;
        res.send({message: 'Not authorized!'});
    }
};

module.exports = authenticateJWT;
