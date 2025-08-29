const { validationResult } = require('express-validator');

exports.handleValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg);

    req.flash('error', errorMessages);
    req.flash('oldInput', req.body);

    if (req.originalUrl.includes('/events/create') && req.method === 'POST') {
      return res.redirect('/events/new');
    }
    else if (req.originalUrl.match(/\/events\/[a-fA-F0-9]{24}$/) && (req.method === 'PUT' || req.method === 'POST')) {
      return res.redirect(`/events/${req.params.id}/edit`);
    }
    else {
      return res.status(400).render('pages/error', {
        message: 'Validation errors',
        error: { errors: errors.array() }
      });
    }
  }
  
  next();
};
