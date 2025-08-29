const express = require('express');
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { validateSignup } = require('../middleware/validateAuth');
const { handleValidation } = require('../middleware/handleValidation');

module.exports = (loginLimiter) => {
  const router = express.Router();

  // Sign up
  router.get('/signup', authController.getSignup);
  router.post('/signup', validateSignup, handleValidation, authController.postSignup); 

  // Login with rate limiter
  router.get('/login', authController.getLogin);
  router.post('/login', loginLimiter, authController.postLogin);

  // Logout
  router.get('/logout', authController.logout);

  // Profile
  router.get('/profile', isAuthenticated, authController.getProfile);
  router.post('/delete-account', isAuthenticated, authController.deleteAccount);

  return router;
};
