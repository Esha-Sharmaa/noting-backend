const { body } = require('express-validator');

const validateLabelName = [
    body('name')
        .trim()
        .notEmpty().withMessage('Label name is required')
        .isLength({ min: 1, max: 50 }).withMessage('Label name must be between 1 and 50 characters')
        .matches(/^[a-zA-Z0-9\s\-_]+$/).withMessage('Label name can only contain letters, numbers, spaces, dashes, and underscores')
];
module.exports = validateLabelName;