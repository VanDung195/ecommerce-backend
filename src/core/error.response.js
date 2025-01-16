'use strict'

const {
    StatusCodes,
    ReasonPhrases
} = require('../utils/httpStatusCodes')


class ErrorResponse extends Error{
    constructor(message, status){
        super(message)
        this.status = status
    }
}

class BadRequestError extends ErrorResponse{
    constructor( message = ReasonPhrases.BAD_REQUEST, statusCode = StatusCodes.BAD_REQUEST){
        super(message, statusCode)
    }
}

class NotFoundError extends ErrorResponse{
    constructor( message = ReasonPhrases.NOT_FOUND, statusCode = StatusCodes.NOT_FOUND) {
        super(message, statusCode)
    }
}

module.exports = {
    BadRequestError,
    NotFoundError,
    ErrorResponse
}