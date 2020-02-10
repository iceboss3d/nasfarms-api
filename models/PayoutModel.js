var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var PayoutSchema = new Schema(
  {
    txId: { type: String, required: true }, // Transaction ID from Paystack or Rave
    amount: { type: Number, required: true }, // Amount Paid to User's bank
    investment: { type: Schema.ObjectId, ref: "Investment", required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payout", PayoutSchema);
