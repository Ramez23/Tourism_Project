// ✅ Load `.env` only in development mode (not in production)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const path = require('path');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

// ✅ Import routes
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const placeRouter = require('./routes/placeRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const cancellationRequestRouter = require('./routes/cancellationRequestRoutes');

const app = express();

// ✅ Middleware to parse request body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// ✅ CORS Configuration
const corsOptions = {
  origin: process.env.CORS || 'http://localhost:3001',
  credentials: true
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ✅ Set Pug as the view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// ✅ GLOBAL MIDDLEWARES
app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet()); // Security headers
app.use(morgan('dev')); // Logging

// ✅ Rate Limiting
app.use(
  '/api',
  rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many requests from this IP, please try again in an hour!'
  })
);

// ✅ Data Sanitization
app.use(mongoSanitize());
app.use(xss());
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// ✅ Debugging: Check if ENV Variables Are Loaded
console.log('🔍 DATABASE:', process.env.DATABASE ? 'Loaded ✅' : '❌ MISSING');
console.log('🔍 CORS Allowed Origin:', process.env.CORS || '❌ MISSING');

// ✅ Test Middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.cookies);
  next();
});

// ✅ ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/place', placeRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/api/v1/cancellation-requests', cancellationRequestRouter);
app.use('/images', express.static('public/img/tours'));
app.use('/images', express.static('public/img/users'));
app.use(
  '/img/users',
  express.static(path.join(__dirname, 'public', 'img', 'users'))
);

// ✅ Handle Unknown Routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// ✅ Global Error Handler
app.use(globalErrorHandler);

module.exports = app;
