const Investment = require("../models/InvestmentModel");
const Package = require("../models/PackageModel");
const { body, validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
const axios = require("axios");
var mongoose = require("mongoose");
const mailer = require("../helpers/mailer");
const { constants } = require("../helpers/constants");
mongoose.set("useFindAndModify", false);

// Book Schema
function InvestmentData(data) {
  this.units = data.units;
  this.txId = data.description;
  this.amount = data.amount;
  this.dueAmount = data.dueAmount;
  this.dueDate = data.dueDate;
  this.user = data.user;
  this.package = data.package;
}

/**
 * Investment List. Admin Dashboard
 *
 * @returns {Object}
 */

// TODO: Admin Validation
exports.investmentList = [
  auth,
  function(req, res) {
    try {
      Investment.find({}).then(investment => {
        if (investment.length > 0) {
          return apiResponse.successResponseWithData(
            res,
            "Investments Succesfully Listed",
            investment
          );
        } else {
          return apiResponse.notFoundResponse(res, "No investments yet");
        }
      });
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  }
];

/**
 * Investment List by specific user. Users dashboard.
 *
 * @returns {Object}
 */

exports.userInvestmentList = [
  auth,
  function(req, res) {
    try {
      Investment.find({ user: req.user._id }).then(investment => {
        if (investment.length > 0) {
          return apiResponse.successResponseWithData(
            res,
            "Investments Succesfully Listed",
            investment
          );
        } else {
          return apiResponse.notFoundResponse(
            res,
            "No investments by this user"
          );
        }
      });
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  }
];

/**
 * Investment Detail.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.investmentDetail = [
  auth,
  function(req, res) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return apiResponse.ErrorResponse(res, "Invalid Investment ID");
    }
    try {
      Investment.findOne({ _id: req.params.id }).then(investment => {
        if (investment !== null) {
          let investmentData = new InvestmentData(investment);
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            investmentData
          );
        } else {
          return apiResponse.ErrorResponse(res, "Something Went Wrong");
        }
      });
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  }
];

/**
 * Invest.
 *
 * @param {string}      package
 * @param {string}      units
 * @param {string}      txId
 *
 * @returns {Object}
 */
exports.invest = [
  auth,
  body("package", "Package ID must be provided.")
    .isLength({ min: 1 })
    .trim(),
  body("units", "Number of Units must be provided.")
    .isLength({ min: 1 })
    .trim(),
  body("txId", "Payment transaction ID must not be provided")
    .isLength({ min: 1 })
    .trim()
    .custom((value, { req }) => {
      return Investment.findOne({ txId: value }).then(investment => {
        if (investment) {
          return Promise.reject(
            "An investment with same payment transaction ID exist."
          );
        }
      });
    }),
  sanitizeBody("*").escape(),
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      }

      const { units, txId } = req.body;
      const packageDetails = await Package.findOne({
        _id: req.body.package
      }).exec();
      const { cost, duration, unitsLeft, startDate, roi } = packageDetails;
      const amount = units * cost;
      const dueAmount = amount + amount * (roi / 100);
      const start = new Date(startDate).getTime();
      const dueDate = new Date(duration * 2592000000 + start);

      // Verify transaction reference
      const transaction = await axios.get(
        `https://api.paystack.co/transaction/verify/${txId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`
          }
        }
      );
      const { status, txAmount } = transaction.data.data;
      if (
        status !== "success" &&
        txAmount / 100 < amount &&
        units < unitsLeft
      ) {
        return apiResponse.ErrorResponse(res, "Invalid Transaction");
      }
      const investment = new Investment({
        units,
        txId,
        amount,
        dueAmount,
        dueDate,
        package: req.body.package,
        user: req.user
      });

      investment.save(async err => {
        if (err) {
          return apiResponse.ErrorResponse(res, err);
        }
        const newUnits = unitsLeft - units;
        await Package.findOneAndUpdate(
          { _id: req.body.package },
          { unitsLeft: newUnits },
          err => {
            if (err) {
              return apiResponse.ErrorResponse(res, "Something Went Wrong");
            }
          }
        );
        let investmentData = new InvestmentData(investment);
        const html = `<p>Hello ${
          req.user.lastName
        },<br/>You have succesfully purchased ${units} units of ${
          packageDetails.title
        }.</p><p>Package start date is: ${new Date(
          startDate
        ).toLocaleDateString("en-NG")}</p>`;
        await mailer.send(
          constants.notification.from,
          req.user.email,
          "Investment Notification",
          html
        );
        return apiResponse.successResponseWithData(
          res,
          "Investment Succesful.",
          investmentData,
          html
        );
      });
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  }
];

/**
 * Cancel Investments.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.cancelInvestment = [
  auth,
  function(req, res) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return apiResponse.validationErrorWithData(
        res,
        "Invalid Error.",
        "Invalid ID"
      );
    }
    try {
      Investment.findById(req.params.id, async (err, foundInvestment) => {
        if (foundInvestment === null) {
          return apiResponse.notFoundResponse(
            res,
            "Investment with such ID does not exists"
          );
        }
        // Get Project Start Date
        const iPackage = await Package.findOne({
          _id: foundInvestment.package
        }).exec();
        const { startDate, title, unitsLeft } = iPackage;
        // Check to ensure we aren't canceling an investment before the start date
        if (new Date().getTime() > new Date(startDate).getTime() + 86400000) {
          return apiResponse.ErrorResponse(
            res,
            "Too Late to Cancel Investment"
          );
        }
        console.log(unitsLeft);
        // TODO: Figure This Shit Out
        await axios
          .post(
            "https://api.paystack.co/refund",
            {
              transaction: foundInvestment.txId,
              customer_note: `Cancelled investment: ${title}`
            },
            {
              headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`
              }
            }
          )
          .then(resp => {
            if (
              resp.data.data.status !== "pending" ||
              resp.data.data.status !== "success"
            ) {
              return apiResponse.ErrorResponse(
                res,
                "Investment Cancellation Failed"
              );
            }
            const newUnits = unitsLeft + foundInvestment.units;
            Package.findOneAndUpdate(
              { _id: foundInvestment.package },
              { unitsLeft: newUnits },
              err => {
                if (err) {
                  return apiResponse.ErrorResponse(res, "Something Went Wrong");
                }
              }
            );

            // Delete Investment
            Investment.findOneAndDelete({ _id: req.params.id }, err => {
              if (err) {
                apiResponse.ErrorResponse(res, "SOmething Went Wrong");
              }
            });
            apiResponse.successResponse(
              res,
              "Investment Cancelled Succesfully"
            );
          })
          .catch(err => {
            console.log(err.response.data);
            if (
              err.response.data.message ===
              "Transaction has been fully reversed"
            ) {
              const newUnits = unitsLeft + foundInvestment.units;
              Package.findOneAndUpdate(
                {
                  _id: foundInvestment.package
                },
                {
                  unitsLeft: newUnits
                },
                err => {
                  if (err) {
                    return apiResponse.ErrorResponse(
                      res,
                      "Something Went Wrong"
                    );
                  }
                }
              );
              // Delete Investment
              Investment.findOneAndDelete(
                {
                  _id: req.params.id
                },
                err => {
                  if (err) {
                    apiResponse.ErrorResponse(res, "SOmething Went Wrong");
                  }
                }
              );
              return apiResponse.ErrorResponse(
                res,
                "Transaction has been fully reversed"
              );
            }
          });
      });
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  }
];
