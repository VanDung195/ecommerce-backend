'use strict'

const mongoose = require('mongoose')
const { db: { host, port, name } } = require('../configs/config.mongodb')
const CONNECT_STRING = `mongodb://${host}:${port}/${name}`;
console.log(CONNECT_STRING);

class Database {
    constructor() {
        this.connect()
    }

    connect(type = 'mongodb'){
        if(1 == 1) {
            mongoose.set('debug', true)
            mongoose.set('debug', {color: true})
        }
        mongoose.connect( CONNECT_STRING, {
            maxPoolSize: 50,
        }).then( _=> {
            console.log('Connected Mongodb success');
        }).catch( error => console.error(`Error connection: ${error}`))
    }

    static getInstance(){
        if(!Database.instance){
            Database.instance = new Database()
        }

        return Database.instance
    }
}

const instanceMongodb = Database.getInstance()

module.exports = instanceMongodb