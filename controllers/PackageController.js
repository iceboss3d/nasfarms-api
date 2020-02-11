const Package = require("../models/PackageModel");
const { body, validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

// Package Schema
function PackageData(data) {
  this.title = data.title;
  this.description = data.description;
  this.cost = data.cost;
  this.duration = data.duration;
  this.startDate = data.startDate;
  this.units = data.units;
  this.roi = data.roi;
  this.unitsLeft = data.unitsLeft;
}

/**
 * Package List.
 *
 * @returns {Object}
 */
exports.packageList = [
  function(req, res) {
    try {
      Package.find(
        {}
      ).then(packages => {
        if (packages.length > 0) {
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            packages
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
 * Package Detail.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.packageDetail = [
  function(req, res) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return apiResponse.ErrorResponse(res, "Invalid Package ID");
    }
    try {
      Package.findOne(
        { _id: req.params.id }
      ).then(packages => {
        if (packages !== null) {
          let packageData = new PackageData(packages);
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            packageData
          );
        } else {
          return apiResponse.notFoundResponse(res, "Package Not Found");
        }
      });
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  }
];

/**
 * Create Package.
 *
 * @param {string}      title
 * @param {string}      description
 * @param {Number}      cost
 * @param {Number}      duration
 * @param {Date}      startDate
 * @param {Number}      units
 * @param {Number}      roi
 *
 * @returns {Object}
 */
exports.createPackage = [
  auth,
  body("cost", "Cost must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  body("description", "Description must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  body("duration", "Duration must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  body("startDate", "Start Date must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  body("units", "Units must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  body("title", "Title must not be empty")
    .isLength({ min: 1 })
    .trim(),
  body("roi", "ROI must not be empty")
    .isLength({ min: 1 })
    .trim(),
  sanitizeBody("*").escape(),
  (req, res) => {
    try {
      const errors = validationResult(req);
      const newPackage = new Package({
        title: req.body.title,
        description: req.body.description,
        cost: req.body.cost,
        duration: req.body.duration,
        startDate: req.body.startDate,
        units: req.body.units,
        roi: req.body.roi,
        unitsLeft: req.body.units
      });

      // TODO: Admin Validation

      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        //Save book.
        newPackage.save(function(err) {
          if (err) {
            return apiResponse.ErrorResponse(res, err);
          }
          let packageData = new PackageData(newPackage);
          return apiResponse.successResponseWithData(
            res,
            "Package Added Succesfully.",
            packageData
          );
        });
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  }
];

/**
 * Update Package.
 *
 * @param {string}      title
 * @param {string}      description
 * @param {Number}      cost
 * @param {Number}      duration
 * @param {Date}      startDate
 * @param {Number}      units
 * @param {Number}      roi
 *
 * @returns {Object}
 */
exports.updatePackage = [
  auth,
  body("cost", "Cost must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  body("description", "Description must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  body("duration", "Duration must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  body("startDate", "Start Date must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  body("units", "Units must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  body("title", "Title must not be empty")
    .isLength({ min: 1 })
    .trim(),
  body("roi", "ROI must not be empty")
    .isLength({ min: 1 })
    .trim(),
  sanitizeBody("*").escape(),
  (req, res) => {
    try {
      const errors = validationResult(req);
      const newPackage = {
        title: req.body.title,
        description: req.body.description,
        cost: req.body.cost,
        duration: req.body.duration,
        startDate: req.body.startDate,
        units: req.body.units,
        roi: req.body.roi
      };

      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
          return apiResponse.validationErrorWithData(
            res,
            "Invalid Error.",
            "Invalid ID"
          );
        } else {
          Package.findById(req.params.id, function(err, foundPackage) {
            if (foundPackage === null) {
              return apiResponse.notFoundResponse(
                res,
                "Package does not exists with this id"
              );
            } else {
              // TODO: Admin Validation
              //Check authorized user
              //update book.
              Package.findOneAndUpdate({_id: req.params.id}, newPackage, function(
                err
              ) {
                if (err) {
                  return apiResponse.ErrorResponse(res, err);
                } else {
                  let packageData = new PackageData(newPackage);
                  return apiResponse.successResponseWithData(
                    res,
                    "Package updated Success.",
                    packageData
                  );
                }
              });
            }
          });
        }
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  }
];


// TODO: Fix delete package endpoint
/**
 * Package Delete.
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
      Package.findById(req.params.id, function(err, foundPackage) {
        if (foundPackage === null) {
          return apiResponse.notFoundResponse(
            res,
            "Package not exists with this id"
          );
        } else {
          //Check authorized user
          if (foundPackage.user.toString() !== req.user._id) {
            return apiResponse.unauthorizedResponse(
              res,
              "You are not authorized to do this operation."
            );
          } else {
            //delete book.
            Package.findByIdAndRemove(req.params.id, function(err) {
              if (err) {
                return apiResponse.ErrorResponse(res, err);
              } else {
                return apiResponse.successResponse(res, "Package delete Success.");
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
