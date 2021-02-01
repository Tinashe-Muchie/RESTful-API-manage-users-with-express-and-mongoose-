const mongoose = require('mongoose')
const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const MongoStore = require('connect-mongo')(session)
const api = require('./api/controller')
const app = express()
const db = mongoose.connect(
    'mongodb://localhost:27017/test'
).then(conn => conn).catch(console.error)

app.use(bodyParser.json())
app.use((req, res, next)=>{
    Promise.resolve(db).then(
        (connection, error)=>(
            typeof connection !== undefined
            ? next()
            : next(new Error ('MongoError'))
        )
    )
})
app.use(session({
    secret: 'MERN Cookbook Secrets',
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({
        collection: 'sessions',
        mongooseConnection: mongoose.connection,
        }),
}))