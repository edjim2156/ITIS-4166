const { body } = require('express-validator');

const allowedCategories = ['On Campus', 'Off Campus', 'Other'];

exports.validateEvent = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required.')
    .escape(),

  body('details')
    .trim()
    .notEmpty().withMessage('Details are required.')
    .escape(),

  body('location')
    .trim()
    .notEmpty().withMessage('Location is required.')
    .escape(),

  body('category')
    .trim()
    .isIn(allowedCategories).withMessage('Invalid category.')
    .escape(),

  body('start')
    .isISO8601().withMessage('Start date must be a valid date.')
    .custom(value => {
      if (new Date(value) <= new Date()) {
        throw new Error('Start date must be in the future.');
      }
      return true;
    }),

  body('end')
    .isISO8601().withMessage('End date must be a valid date.')
    .custom((value, { req }) => {
      const start = new Date(req.body.start);
      const end = new Date(value);
      if (end <= start) {
        throw new Error('End date must be after start date.');
      }
      return true;
    })
];
