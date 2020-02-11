const User = require("../models/UserModel");
const UserDetails = require("../models/UserDetailsModel");
const { body, validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

// User Schema
function UserData(data) {
  this.firstName = data.firstName;
  this.lastName = data.lastName;
  this.phoneNumber = data.phoneNumber;
}
// UserDetail Schema
function UserDetailsData(data) {
  this.bank = data.bank;
  this.accountName = data.accountName;
  this.accountNumber = data.accountNumber;
  this.user = data.user;
}

/**
 * Book List.
 *
 * @returns {Object}
 */
exports.bookList = [
  auth,
  function(req, res) {
    try {
      Book.find(
        { user: req.user._id },
        "title description isbn createdAt"
      ).then(books => {
        if (books.length > 0) {
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            books
          );
        } else {
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            {}
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
 * User Detail as User.
 *
 *
 * @returns {Object}
 */
exports.getUserDetail = [
  auth,
  function(req, res) {    
    try {
      UserDetails.findOne(
        { user: req.user._id }, ((err, user) => {
          if(err){
            return apiResponse.ErrorResponse(res, err);
          }
          return apiResponse.successResponseWithData(res, "User Details Fetched", user);
        })
      );
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  }
];

/**
 * Create UserDetails.
 *
 * @param {string}      bank
 * @param {string}      accountNumber
 * @param {string}      accountName
 *
 * @returns {Object}
 */
exports.newDetails = [
  auth,
  body("bank", "Bank must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  body("accountNumber", "Account Number must be 10 digits.")
    .isLength({ min: 10, max: 10 })
    .trim(),
  body("accountName", "Account Name must not be empty")
    .isLength({ min: 1 })
    .trim(),
  sanitizeBody("*").escape(),
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      }
      UserDetails.findOne({user: req.user}, (err, user) => {
        if(err){
          return apiResponse.ErrorResponse(res, err);
        }
        if(user){
          return apiResponse.ErrorResponse(res, "User Details Present");
        }

        // Init User Details
        const userDetail = new UserDetails({
          bank: req.body.bank,
          accountNumber: req.body.accountNumber,
          accountName: req.body.accountName,
          user: req.user
        });

        // Save User Details
        userDetail.save(err => {
          if(err){
            return apiResponse.ErrorResponse(res, err);
          }
          const userDetailsData = new UserDetailsData(userDetail);
          return apiResponse.successResponseWithData(res, "User Detail Created", userDetailsData);
        });
      });
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  }
];

/**
 * Update User Details.
 *
 * @param {string}      bank
 * @param {string}      accountNumber
 * @param {string}      accountName
 *
 * @returns {Object}
 */
exports.updateUserDetails = [
  auth,
  body("bank", "Bank must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  body("accountNumber", "Account Number must be 10 digits.")
    .isLength({ min: 10, max: 10 })
    .trim(),
  body("accountName", "Account Name must not be empty")
    .isLength({ min: 1 })
    .trim(),
  sanitizeBody("*").escape(),
  (req, res) => {
    try {
      const errors = validationResult(req);
      
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      }
      var userDetails = {
        bank: req.body.bank,
        accountNumber: req.body.accountNumber,
        accountName: req.body.accountName,
        user: req.user
      };
      
      UserDetails.findOne({user: req.user}, (err, user) => {
        if (user) {
          UserDetails.updateOne({user: req.user}, userDetails, (err) => {
            if(err){
              return apiResponse.ErrorResponse(res, err);
            }            
          });
          const userDetailsData = new UserDetailsData(userDetails);
          return apiResponse.successResponseWithData(
            res,
            "User Details Updated",
            userDetailsData
          );
        } else {
          const userDetail = new UserDetails(userDetails);
          // Save UserDetails
          userDetail.save((err) => {
            if(err){
              apiResponse.ErrorResponse(res, err);
            }
          });
          const userDetailsData = new UserDetailsData(userDetails);
          return apiResponse.successResponseWithData(
            res,
            "User Details Created",
            userDetailsData
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
 * Book Delete.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.bookDelete = [
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
      Book.findById(req.params.id, function(err, foundBook) {
        if (foundBook === null) {
          return apiResponse.notFoundResponse(
            res,
            "Book not exists with this id"
          );
        } else {
          //Check authorized user
          if (foundBook.user.toString() !== req.user._id) {
            return apiResponse.unauthorizedResponse(
              res,
              "You are not authorized to do this operation."
            );
          } else {
            //delete book.
            Book.findByIdAndRemove(req.params.id, function(err) {
              if (err) {
                return apiResponse.ErrorResponse(res, err);
              } else {
                return apiResponse.successResponse(res, "Book delete Success.");
              }
            });
          }
        }
      });
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  }
];
