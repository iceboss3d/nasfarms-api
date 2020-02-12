const express = require("express");
const UserController = require("../controllers/UserController");

const router = express.Router();

router.get("/list", UserController.userList);
router.get("/list/:id", UserController.getUser);
router.get("/:id", UserController.getUserDetailAdmin);
router.get("/u/", UserController.getUserDetail);
router.post("/", UserController.newDetails);
router.put("/", UserController.updateUserDetails);
// router.delete("/:id", BookController.bookDelete);

module.exports = router;
