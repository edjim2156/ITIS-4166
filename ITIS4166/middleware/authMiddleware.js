function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  } else {
    req.flash('error', 'You must be logged in to view that page.');
    res.redirect('/login');
  }
}

function isAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  } else {
    req.flash('error', 'You must be an admin to view that page.');
    res.redirect('/login');
  }
}

module.exports = { isAuthenticated, isAdmin };
