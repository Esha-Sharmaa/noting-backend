const { Router } = require('express');
const passport = require('passport');
require('../utils/passport.js');
const {
    localLogin,
    googleLogin,

} = require("../controllers/auth.controller.js");
const router = Router();

router.route('/login').post(localLogin);

// google login routes
router.route('/auth/google').get(passport.authenticate('google', { scope: ['profile', 'email'] }));
router.route('/auth/google/callback').get(passport.authenticate('google', { failureRedirect: '/login' }), googleLogin);

module.exports = router;