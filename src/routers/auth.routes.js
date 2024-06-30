const { Router } = require('express');
const passport = require('passport');
const { registerUser } = require("../controllers/user.controller.js");
const validateRegisterUser = require("../validations/validateRegisterUser.js");
require('../utils/passport.js');
const {
    googleLogin,
} = require("../controllers/auth.controller.js");

const router = Router();

// google login routes
router.route('/auth/google').get(passport.authenticate('google', { scope: ['profile', 'email'] }));
router.route('/auth/google/callback').get(passport.authenticate('google', { failureRedirect: '/login' }), googleLogin);

module.exports = router;