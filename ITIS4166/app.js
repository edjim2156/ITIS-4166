const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// ---------- DATABASE ----------
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('MongoDB connection error:', err));

// ---------- MIDDLEWARE: Core Setup ----------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// ---------- VIEW ENGINE ----------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ---------- SESSION AND FLASH ----------
app.use(session({
  secret: process.env.SESSION_SECRET || 'yourSecretKeyHere',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true
  }
}));
app.use(flash());

// ---------- LOCALS FOR VIEWS ----------
app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.userName = req.session?.user?.username || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// ---------- RATE LIMITING FOR LOGIN ----------
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts. Try again later.',
});

// ---------- ROUTES ----------
const mainRoutes = require('./routes/main');
const authRoutes = require('./routes/auth')(loginLimiter);
app.use('/', mainRoutes);
app.use('/', authRoutes);

// ---------- ERROR HANDLING ----------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).render('pages/error', {
    message: err.message || 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// ---------- START SERVER ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
