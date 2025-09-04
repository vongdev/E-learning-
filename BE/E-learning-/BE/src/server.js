const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Import Middlewares
const errorHandler = require('./middleware/error');
const { apiLimiter, authLimiter, createUserLimiter, submissionLimiter } = require('./middleware/rateLimit');
const { cacheMiddleware } = require('./middleware/cache');

// Import DB and Routes
const connectDB = require('./config/db');
const mainRouter = require('./routes/index.routes'); // Sử dụng file route chính
const socketHandler = require('./socket/socket'); // Tách logic socket

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const httpServer = createServer(app);

// Body parser
app.use(express.json({ limit: '10kb' })); // Giới hạn payload
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Security middleware
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());
app.use(compression());

// Enable CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Apply general rate limiter to all API requests
app.use('/api', apiLimiter);

// Apply specific rate limiters
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', createUserLimiter);
app.use('/api/assignments/:assignmentId/submissions', submissionLimiter);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount main router
app.use('/api/v1', mainRouter); // Versioning API

// Health check endpoint
app.get('/health', (req, res) => res.status(200).send('OK'));

// Error handler middleware (should be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = httpServer.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold);
});

// Set up Socket.IO for real-time features
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.IO connection handler
io.on('connection', socketHandler(io));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = server;