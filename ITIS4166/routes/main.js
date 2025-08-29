const express = require('express');
const path = require('path');
const multer = require('multer');
const router = express.Router();

const eventController = require('../controllers/eventController');
const authController = require('../controllers/authController');
const rsvpController = require('../controllers/rsvpController');

const { isAuthenticated } = require('../middleware/authMiddleware');
const { validateEvent } = require('../middleware/validateEvent');
const { validateSignup } = require('../middleware/validateAuth');
const { handleValidation } = require('../middleware/handleValidation');

// Multer storage config for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

/* ---------- Static + Public Routes ---------- */
router.get('/', (req, res) => res.render('pages/home'));
router.get('/home', (req, res) => res.redirect('/'));
router.get('/about', (req, res) => res.render('pages/about'));
router.get('/contact', (req, res) => res.render('pages/contact'));

/* ---------- Authentication Routes (with validation) ---------- */
router.get('/signup', authController.getSignup);
router.post('/signup', validateSignup, handleValidation, authController.postSignup);

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

router.get('/logout', authController.logout);

/* ---------- User Profile ---------- */
router.get('/profile', isAuthenticated, authController.getProfile);

/* ---------- Event Routes ---------- */
// Show all events
router.get('/events', eventController.showEvents);

// Show create event form (protected)
router.get('/events/new', isAuthenticated, (req, res) => {
  res.render('pages/newEvent', {
    user: req.session.user,
    flashError: req.flash('error'),
    oldInput: req.flash('oldInput')[0] || {}
  });
});

// Create event (with validation and image upload)
router.post(
  '/events/create',
  isAuthenticated,
  upload.single('image'),
  validateEvent,
  handleValidation,
  eventController.createEvent
);

// Event detail page
router.get('/events/:id', isAuthenticated, eventController.eventDetail);

// Edit event form
router.get('/events/:id/edit', isAuthenticated, async (req, res) => {
  const event = await Event.findById(req.params.id).lean();

  if (!event) return res.status(404).render('pages/error', { message: 'Event not found.' });

  const oldInput = req.flash('oldInput')[0] || {};
  const flashError = req.flash('error');

  const eventData = Object.assign({}, event, oldInput);

  res.render('pages/editEvent', {
    user: req.session.user,
    event: eventData,
    flashError
  });
});

// Update event (with validation and image upload)
router.put(
  '/events/:id',
  isAuthenticated,
  upload.single('image'),
  validateEvent,
  handleValidation,
  eventController.updateEvent
);

// Delete event
router.delete('/events/:id', isAuthenticated, eventController.deleteEvent);

/* ---------- RSVP Routes ---------- */
router.post('/events/:eventId/rsvp', isAuthenticated, rsvpController.handleRsvp);

/* ---------- 404 Catch-All ---------- */
router.use((req, res) => {
  res.status(404).render('pages/error', {
    message: 'Page Not Found',
    error: {}
  });
});

module.exports = router;
