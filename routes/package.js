const express = require("express");
const PackageController = require("../controllers/PackageController");

var router = express.Router();

router.get("/", PackageController.packageList);
router.get("/:id", PackageController.packageDetail);
router.post("/", PackageController.createPackage);
router.put("/:id", PackageController.updatePackage);
router.delete("/:id", PackageController.bookDelete);

module.exports = router;
