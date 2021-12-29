require('dotenv').config()
module.exports = {
HOST: process.env.RDS_HOSTNAME,
USER: process.env.RDS_USERNAME,
PASSWORD: process.env.RDS_PASSWORD,
DB: process.env.RDS_DB_NAME,
dialect: "postgres",
pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 20000
},
dialectOptions: {
    useUTC: false, //for reading from database
    dateStrings: true,
    typeCast: true
},
timezone: '-05:00'
}