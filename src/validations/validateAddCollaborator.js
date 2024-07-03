const { body } = require("express-validator");

const validateAddCollaborator = [
  body("email")
    .notEmpty()
    .withMessage("Collabortaor is required")
    .isEmail()
    .withMessage("Email must be a valid email address"),
  body("noteId")
    .notEmpty()
    .withMessage("Note ID is required")
    .isMongoId()
    .withMessage("Note ID must be a valid MongoDB ObjectId"),
  body("permission")
    .notEmpty()
    .withMessage("Permission is required")
    .isIn(["read", "write"])
    .withMessage('Permission must be either "read" or "write"'),
];

module.exports = validateAddCollaborator;
