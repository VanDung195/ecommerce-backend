'use strict'

const {
    StatusCodes,
    ReasonPhrases
} = require('../utils/httpStatusCodes')

class SuccessResponse{
    constructor({ message, statusCode = StatusCodes.OK, ReasonPhrases = ReasonPhrases.OK, metadata = {}}){
        this.message = !message ? ReasonPhrases.OK : message,
        this.status = statusCode,
        this.metadata = metadata
    }

    send(res, headers = {}) {
        return res.status(this.status).json(this)
    }
}

class OK extends SuccessResponse{
    constructor({ message, metadata}){
        super(message, metadata)
    }
}

module.exports = {
    SuccessResponse,
    OK
}