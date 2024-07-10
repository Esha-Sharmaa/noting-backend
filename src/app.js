const express = require("express");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const session = require("express-session");
const errorHandler = require("./middleware/errorHandler.middleware.js");
require("./utils/passport.js");

const app = express();

// middleware configuration
app.use(
  cors({
    origin: "*",
    credentials: true, // Allow credentials (cookies, authorization headers, TLS client certificates)
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(express.static("public"));

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
    saveUninitialized: false, // Ensure this is correctly set
    resave: false, // Ensure this is correctly set
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// importing routes
const authRoutes = require("./routers/auth.routes.js");
const userRoutes = require("./routers/user.routes.js");
const noteRoutes = require("./routers/note.routes.js");
const labelRoutes = require("./routers/label.routes.js");
const collaboratorRoutes = require("./routers/collaborator.routes.js");

app.get("/", (req, res) => {
  res.send("Hello From the server");
});
app.use(authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/notes", noteRoutes);
app.use("/api/v1/labels", labelRoutes);
app.use("/api/v1/collaborators", collaboratorRoutes);

// using error handling custom middleware
app.use(errorHandler);
module.exports = app;
