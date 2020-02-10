var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var UserDetailsSchema = new Schema(
  {
    bank: { type: String, required: true },
    accountNumber: { type: String, required: true },
    accountName: { type: String, required: true },
    user: { type: Schema.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserDetails", UserDetailsSchema);
