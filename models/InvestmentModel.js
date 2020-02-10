var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var InvestmentSchema = new Schema(
  {
    units: { type: Number, required: true }, // The number of units purchased
    txId: { type: String, required: true }, // The transaction ID from Paystack
    amount: { type: Number, required: true }, // The transaction amount paid to paystack to be used to compute ROI
    dueAmount: { type: Number, required: true }, // The amount to be paid to investor. Amount + Amount * Package ROI
    user: { type: Schema.ObjectId, ref: "User", required: true }, // The user who made the transaction 
    package: { type: Schema.ObjectId, ref: "Package", required: true }, // The Package the User purchased
  },
  { timestamps: true }
);

module.exports = mongoose.model("Investment", InvestmentSchema);
