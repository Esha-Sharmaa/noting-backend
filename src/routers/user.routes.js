const { Router } = require("express");
const validateRegisterUser = require("../validations/validateRegisterUser.js");
const {
    registerUser,
    login,
    logout,
    getUserProfile,
    refreshAccessToken,
} = require("../controllers/user.controller.js");
const verifyJwt = require("../middleware/auth.middleware.js");
const router = Router();

router.route("/register").post(validateRegisterUser, registerUser);
router.route("/login").post(login);
router.route("/logout").post(verifyJwt, logout);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/profile").get(verifyJwt, getUserProfile);

module.exports = router;
