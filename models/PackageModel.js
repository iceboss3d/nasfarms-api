var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var PackageSchema = new Schema(
  {
    title: { type: String, required: true, unique: true }, // The title of the package
    description: { type: String, required: true }, // The Package description
    cost: { type: Number, required: true }, // The cost of each unit
    duration: { type: Number, required: true }, // In Months, the number of months the investment would last
    startDate: { type: Date, required: true }, // The date investment starts counting
    units: { type: Number, required: true }, // Number of Units the package offers
    roi: { type: Number, required: true, max: 100 }, // In percentage and should max at 100
    unitsLeft: { type: Number } // Number of units left
  },
  { timestamps: true }
);

module.exports = mongoose.model("Package", PackageSchema);
