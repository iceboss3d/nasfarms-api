const express = require("express");
const UserController = require("../controllers/UserController");

const router = express.Router();

// router.get("/", BookController.bookList);
// router.get("/:id", BookController.bookDetail);
router.post("/", UserController.newDetails);
router.put("/", UserController.updateUserDetails);
// router.delete("/:id", BookController.bookDelete);

module.exports = router;
