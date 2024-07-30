const express = require("express");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const session = require("express-session");
const errorHandler = require("./middleware/errorHandler.middleware.js");

const app = express();

// Configure CORS
const corsOptions = {
  origin: "https://noting-frontend.vercel.app/",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    "https://noting-frontend.vercel.app/"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(express.static("public"));

app.use(
  session({
    secret: "secret-key",
    resave: false,
    cookie: { secure: true },
    saveUninitialized: false,
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// importing routes
const userRoutes = require("./routers/user.routes.js");
const noteRoutes = require("./routers/note.routes.js");
const labelRoutes = require("./routers/label.routes.js");
const collaboratorRoutes = require("./routers/collaborator.routes.js");

app.get("/", (req, res) => {
  res.send("Hello From the server");
});

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/notes", noteRoutes);
app.use("/api/v1/labels", labelRoutes);
app.use("/api/v1/collaborators", collaboratorRoutes);

// using error handling custom middleware
app.use(errorHandler);
module.exports = app;
