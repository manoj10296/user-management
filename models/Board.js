const mongoose = require('mongoose')

const BoardSchema = new mongoose.Schema({
  title: String,
  lists: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "List"
    }
  ],
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ]
},
  {
    timestamps: true
  }
)

const Board = mongoose.model('Board', BoardSchema)

module.exports = Board