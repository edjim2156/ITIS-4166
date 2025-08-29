const { body } = require('express-validator');

exports.validateSignup = [
  body('firstName')
    .trim().notEmpty().withMessage('First name is required.')
    .escape(),

  body('lastName')
    .trim().notEmpty().withMessage('Last name is required.')
    .escape(),

  body('email')
    .trim().isEmail().withMessage('Must be a valid email address.')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 8, max: 64 })
    .withMessage('Password must be 8-64 characters.')
];
