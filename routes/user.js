const express = require("express");
const UserController = require("../controllers/UserController");

const router = express.Router();

// router.get("/", BookController.bookList);
router.get("/u/", UserController.getUserDetail);
router.post("/", UserController.newDetails);
router.put("/", UserController.updateUserDetails);
// router.delete("/:id", BookController.bookDelete);

module.exports = router;
