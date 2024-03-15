const Superadmin = require('../models/users/superadmin');
const Admin = require('../models/users/admin');
const Client = require('../models/users/client');
const Expert = require('../models/users/expert');
module.exports = {
    secretKey: 'askd327yhsd237yrshbf2378fskb',
    domain: 'localhost:8080',
    userCollections: Array.of(Superadmin, Admin, Expert, Client)
}
