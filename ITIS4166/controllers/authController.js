const User = require('../models/user');
const Event = require('../models/eventMongo'); 
const RSVP = require('../models/rspv');
const { body } = require('express-validator');


// GET: Sign Up Page
exports.getSignup = (req, res) => {
  res.render('pages/signup', {
    flashError: req.flash('error') || [],
    oldInput: req.flash('oldInput')[0] || {}
  });
};

// POST: Handle User Signup
exports.postSignup = async (req, res) => {
  try {
    const { username, firstName, lastName, email, password, 'confirm-password': confirmPassword } = req.body;

    if (!username || !firstName || !lastName || !email || !password || !confirmPassword) {
      req.flash('error', 'All fields are required.');
      return res.redirect('/signup');
    }

    if (password !== confirmPassword) {
      req.flash('error', 'Passwords do not match.');
      return res.redirect('/signup');
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      req.flash('error', 'Username or email is already in use.');
      return res.redirect('/signup');
    }

    const newUser = new User({ username, firstName, lastName, email, password });
    await newUser.save();

    req.session.user = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
    };

    req.flash('success', 'Account created successfully!');
    res.redirect('/events');

  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      req.flash('error', 'Validation failed. Please check your input.');
      return res.redirect('/signup');
    }

    req.flash('error', 'Something went wrong. Please try again.');
    res.redirect('/signup');
  }
};

// GET: Login Page
exports.getLogin = (req, res) => {
  res.render('pages/login', {
    error: req.flash('error'),
    success: req.flash('success'),
  });
};

// POST: Handle User Login
exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      req.flash('error', 'Please enter both email and password.');
      return res.redirect('/login');
    }

    const user = await User.findOne({ email });
    if (!user) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/login');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/login');
    }

    req.session.user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    req.flash('success', `Welcome back, ${user.username}!`);
    res.redirect('/events'); 

  } catch (error) {
    console.error(error);
    req.flash('error', 'Something went wrong. Please try again.');
    res.redirect('/login');
  }
};

// GET: Logout
exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) console.error(err);
    res.redirect('/login');
  });
};

// GET: Profile Page (Protected)
exports.getProfile = async (req, res) => {
  try {
    const userId = req.session.user._id;

    const events = await Event.find({ createdBy: userId }).lean();

    const rsvps = await RSVP.find({ user: userId }).populate('event').lean();

    res.render('pages/profile', {
      user: req.session.user,
      events,
      rsvps,
      flashSuccess: req.flash('success'),
      flashError: req.flash('error')
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('pages/error', { message: 'Error loading profile.' });
  }
};


// POST: Delete Account
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.session.user._id;

    await User.findByIdAndDelete(userId);

    req.session.destroy(err => {
      if (err) console.error(err);
      req.flash('success', 'Your account has been deleted.');
      res.redirect('/');
    });

  } catch (error) {
    console.error(error);
    req.flash('error', 'Failed to delete account. Please try again.');
    res.redirect('/profile');
  }
};

