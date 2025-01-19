const express = require('express')
const morgan = require('morgan')
const { default: helmet} = require('helmet')
const compression = require('compression')
const app = express()

app.use(morgan('dev'))
app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({
    extended: true, 
}))

//init db
require('./dbs/init.mongodb')
const ioredis = require('./dbs/init.ioredis')
ioredis.init({
    IOREDIS_HOST: 'localhost',
    IOREDIS_PORT: 6379,
    IOREDIS_IS_ENABLED: true
})




app.use('/', require('./routes'))


//error handler
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    const statusCode = error.status || 500
    return res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        stack: error.stack,
        message: error.message || 'Internal Server Error'
    })
})



module.exports = app