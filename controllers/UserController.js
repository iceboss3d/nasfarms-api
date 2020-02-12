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
 * List Users.
 *
 * @returns {Object}
 */
exports.userList = [
  auth,
  function(req, res) {
    try {
      User.find({}, (err, users) => {
        if(err){
          return apiResponse.ErrorResponse(res, err);
        }
        return apiResponse.successResponseWithData(res, "Successfully Fetched all Users", users);
      });
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  }
];


/**
 * Get a User.
 *
 * @returns {Object}
 */
exports.getUser = [
  auth,
  function(req, res) {
    try {
      User.findOne({_id: req.params.id}, (err, user) => {
        if(err){
          return apiResponse.ErrorResponse(res, err);
        }
        if(!user){
          return apiResponse.notFoundResponse(res, "No User found with such ID");
        }
        return apiResponse.successResponseWithData(res, "Successfully Fetched User", user);
      });
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  }
];

/**
 * User Detail as Admin.
 *
 * @param {string} id
 *
 * @returns {Object}
 */
exports.getUserDetailAdmin = [
  auth,
  function(req, res) {    
    try {
      UserDetails.findOne(
        { user: req.params.id }, ((err, user) => {
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
 * Admin Disable User.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.disableUser = [
  auth,
  function(req, res) {
    try {
      User.findOneAndUpdate({_id: req.params.id}, {status: false}, (err) => {
        if(err){
          return apiResponse.ErrorResponse(res, err);
        }
        return apiResponse.successResponse(res, "User Disabled");
      });
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  }
];

/**
 * Admin Activate User.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.activateUser = [
  auth,
  function(req, res) {
    try {
      User.findOneAndUpdate({_id: req.params.id}, {status: true}, (err) => {
        if(err){
          return apiResponse.ErrorResponse(res, err);
        }
        return apiResponse.successResponse(res, "User Activated");
      });
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  }
];
