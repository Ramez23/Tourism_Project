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
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const placeRouter = require('./routes/placeRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const cancellationRequestRouter = require('./routes/cancellationRequestRoutes');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json({ limit: '10mb' })); // Adjust the limit as needed
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// CORS configuration
const corsOptions = {
  origin: process.env.CORS || 'http://localhost:3001', // Use .env value, fallback to localhost
  credentials: true // Allow cookies to be sent with requests
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet());
app.use(morgan('dev'));
app.use(
  '/api',
  rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!'
  })
);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
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

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.cookies);
  next();
});

// 3) ROUTES
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

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
