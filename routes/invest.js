const express = require("express");
const InvestmentController = require("../controllers/InvestmentController");

var router = express.Router();

router.get("/", InvestmentController.investmentList);
router.get("/u", InvestmentController.userInvestmentList);
router.get("/:id", InvestmentController.investmentDetail);
router.post("/", InvestmentController.invest);
// router.put("/:id", InvestmentController.updateInvestment);
router.delete("/:id", InvestmentController.cancelInvestment);

module.exports = router;
