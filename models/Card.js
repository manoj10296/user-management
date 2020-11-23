const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CardSchema = new Schema(
  {
    title: String,
    description: String,
    list: {
      type: Schema.Types.ObjectId,
      ref: "List"
    },
    activities: [
      {
        type: Schema.Types.ObjectId,
        ref: "Activity"
      }
    ],
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  {
    timestamps: true
  }
);

const Card = mongoose.model("Card", CardSchema);

module.exports = Card;
