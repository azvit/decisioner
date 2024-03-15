const constants = require('../Constants');

exports.defineStatusCode = function (message) {
    switch (message) {
        case constants.SUCCESS_MESSAGE: {
            return 200;
        }
        case constants.NOT_FOUND_MESSAGE: {
            return 404
        }
        case constants.FORBIDDEN_MESSAGE: {
            return 403
        }
        case constants.ERROR_MESSAGE: {
            return 500
        }
        case constants.ALREADY_IS_MESSAGE: {
            return 400
        }
        case constants.NOT_EXIST_MESSAGE: {
            return 400
        }
    }
}
