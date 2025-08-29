const { isAuthenticated, isAdmin, isGuest } = require('../middleware/roleMiddleware');

router.get('/signup', isGuest, authController.getSignup);
router.post('/signup', authController.postSignup);

router.get('/login', isGuest, authController.getLogin);
router.post('/login', authController.postLogin);

router.get('/logout', authController.logout);

router.get('/profile', isAuthenticated, authController.getProfile);

