const { Router } = require("express");
const validateRegisterUser = require("../validations/validateRegisterUser.js");
const {
  registerUser,
  login,
  logout,
  getUserProfile,
  generateAccessToken,
} = require("../controllers/user.controller.js");
const router = Router();

router.route("/register").post(validateRegisterUser, registerUser);
router.route("/login").post(login);
router.route("/logout").post(logout);
router.route("/refresh-token").post(generateAccessToken);
router.route("/profile").get(getUserProfile);

module.exports = router;
