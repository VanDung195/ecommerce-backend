'use strict'
require('dotenv').config()
//lv0

const config = {
    app: {
        port: 3000
    },
    db: {
        host: 'localhost',
        port: 27017,
        name: 'ecommerce'
    }
};


module.exports = config

//lv01

// const dev = {
//     app: {
//         port: process.env.DEV_APP_PORT || 3000
//     },
//     db: {
//         host: process.env.DEV_DB_HOST || 'localhost',
//         port: process.env.DEV_DB_PORT || 27017,
//         name: process.env.DEV_DB_NAME || 'dbDev'
//     }
// };
// const pro = {
//     app: {
//         port: process.env.PRO_APP_PORT || 3000
//     },
//     db: {
//         host: process.env.PRO_DB_HOST || 'name',
//         port: process.env.PRO_DB_PORT || 27017,
//         name: process.env.PRO_DB_NAME || 'dbPro'
//     }
// };


// const config = {dev, pro}
// const env =  process.env.NODE_ENV || 'dev'
// module.exports = config[env]