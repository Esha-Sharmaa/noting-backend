const express = require('express');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const session = require('express-session');
require('./utils/passport.js'); // Ensure passport strategies are configured


const app = express();

app.use(
    cors()
);
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser());
app.use(express.static('public'));

app.use(session({
    secret: 'your_secret_key',  // Replace with a strong secret key
    resave: true,
    saveUninitialized: true
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
// importing routes 
const authRoutes = require("./routers/auth.routes.js");
app.get('/', (req, res) => {
    res.send('Hello From the server');
});
app.use(authRoutes);
module.exports = app;