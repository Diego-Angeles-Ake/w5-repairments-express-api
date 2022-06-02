const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { globalErrorHandler } = require('./controllers/errors.controller');
const { repairsRouter } = require('./routes/repairs.routes');
const { usersRouter } = require('./routes/users.routes');

const app = express();

/* ------------------------------- Enable CORS ------------------------------ */
app.use(cors());

/* -------------------------- Enable incoming JSON -------------------------- */
app.use(express.json());

/* ------------------------- Enable security headers ------------------------ */
app.use(helmet());

/* --------------------------- Compress responses --------------------------- */
app.use(compression());

/* -------------------------- Log incoming requests ------------------------- */
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('combined'));
}

/* ----------------------------- Limit requests ----------------------------- */
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 60 * 1000, // 1 hour
  max: 10000, // Limit each IP to 10000 requests per `window` (here, per 1 hour)
  message: 'Too many requests',
});

// Apply the rate limiting middleware to API calls only
app.use(apiLimiter);

/* -------------------------------- Endpoints ------------------------------- */
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/repairs', repairsRouter);

/* -------------------------- Global error handler -------------------------- */
app.use('*', globalErrorHandler);

module.exports = { app };
