const User = require('../models/User')

module.exports = {
  // editUser: async(req, res, next) => {
  //   try {
  //     const result = await User.findOne({_id: req.params.id})

  //   } catch (error) {

  //   }
  // },
  getAllUsers: async (req, res, next) => {
    try {
      const result = await User.find({})
      return res.json({
        message: 'All users',
        data: {
          users: result
        }
      })
    } catch (error) {
      next(error)
    }
  },
  getUserBoards: async (req, res, next) => {
    User.findById(req.user._id)
      .populate({
        path: "boards",
        populate: {
          path: "lists",
          populate: {
            path: "cards",
            populate: {
              path: "members"
            }
          }
        }
      })
      .then(user => {
        res.json({ data: user.boards });
      })
      .catch(error => next(error));

  }
}