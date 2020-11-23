const createError = require('http-errors')
const User = require('../models/User')
const { omit } = require('lodash')
const jwt = require('jsonwebtoken')

module.exports = {
  register: async (req, res, next) => {
    try {
      console.log('body', req.body)
      const { email, password } = req.body
      const users = await User.find()
      const doesExist = await User.findOne({ email })
      console.log('sasdasd', doesExist, users)
      if (doesExist) {
        throw createError.Conflict(`${email} is already been registered`)
      }

      const user = new User(req.body)
      const savedUser = await user.save()
      console.log('ssss', savedUser)
      res.send(savedUser)

    } catch (error) {
      next(error)
    }
  },

  login: async (req, res, next) => {
    try {
      console.log(req.body)
      const user = await User.findOne({ email: req.body.email })

      console.log('user', user)
      if (!user) {
        throw createError.NotFound('User not registered')
      }

      const isMatch = await user.isValidPassword(req.body.password)

      if (!isMatch) {
        throw createError.Unauthorized('Username or password is incorrect')
      }
      const data = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }

      const accessToken = jwt.sign(data, "Secret")

      res.json({
        accessToken,
        user
      })
    } catch (err) {
      next(err)
    }
  }
}