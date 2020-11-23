const mongoose = require('mongoose')

const ListSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board"
    },
    cards: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Card'
      }
    ]
  }, {
  timestamps: true
}
)

const List = mongoose.model('List', ListSchema)

module.exports = List