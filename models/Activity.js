const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ActivitySchema = new Schema(
  {
    description: String,
    card: {
      type: Schema.Types.ObjectId,
      ref: "Card"
    }
  },
  {
    timestamps: true
  }
);

const Activity = mongoose.model("Activity", ActivitySchema);

module.exports = Activity;
