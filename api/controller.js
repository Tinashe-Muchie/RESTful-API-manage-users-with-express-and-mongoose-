const express = require('express')
const User = require('./model')
const api = express.Router()

//request handler to check if user is logged in
const isLogged = ({session}, res, next)=>{
    (!session.user)
    ? res.status(403).json({
        status: 'You are not logged in'})
    : next()
}

//request handler to check if user is not logged in
const isNotLogged = ({session}, res, next)=>{
    (session.user)
    ? res.status(403).json({
        status: 'You are already logged in'
    })
    : next()
}

//post request method to handle the login endpoint
api.post('/login', isNotLogged, async(req, res)=>{
    try {
        const { session, body } = req
        const {username, password} = body
        const user = await User.login(username, password)
        session.user = {
            _id = user._id,
            username = user.username,
        }
        session.save(()=>{
            res.status(200).json({
                status: 'Welcome!'
            })
        })
    }catch(error) {
        res.status(403).json({error: error.message})
    }
})

//post request method to handle the logout endpoint
api.post('/logout', isLogged, (req, res)=>{
    req.session.destroy()
    res.status(200).send({status: 'Bye Bye'})
}) 

//post request method to handle the sign up endpoint
api.post('/signup', async(req, res)=>{
    try{
        const {session, body} = req
        const {username, password} = body
        const user = await User.signup(username, password)
        res.status(201).json({status: 'Created!'})
    }catch(error){
        res.status(403).json({error: error.message})
    }
})

//get request method to handle the profile endpoint
api.get('/profile', (req, res)=>{
    const {user} = req.session
    res.status(200).json({user})
})

//put request method to handle the change password endpoint
api.put('/changepass', isLogged, async(req, res)=>{
    try {
        const {session, body} = req
        const {password} = body
        const { _id} = session.user
        const user = await User.findOne({_id})
        if (user){
            user.changePass(password)
            res.status(200).json({status: 'Password changed!'})
        }else {
            res.status(403),json({status: user})
        }
    }catch(error){
        res.status(403).json({error: error.message})
    }
})

//delete request to handle the delete endpoint
api.delete('/delete', isLogged, async(req, res)=>{
    try{
        const {_id} = req.session.user
        const user = await User.findOne(_id)
        await user.remove()
        req.session.destroy((err)=>{
            if (err) throw new Error(err)
            res.status(200).json({status: 'deleted'})
        }) 
    }catch(error){
        res.status(403),json({error: error.message})
    }
})

module.exports = api