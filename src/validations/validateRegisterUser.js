const { body } = require('express-validator');

const validateRegisterUser = [
    body('fullName')
        .notEmpty().withMessage("Email is required")
        .isString().withMessage("Full Name should be a string")
        .isLength({ min: 3 }).withMessage("Name should contain alleast 3 characters")
        .matches(/^[A-Za-z\s]+$/).withMessage("Name must contain only alphabets and spaces"),

    body('email')
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid Email Address"),

    body('password').notEmpty().withMessage("Password is required")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/)


];
module.exports = validateRegisterUser;