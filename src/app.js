const fs = require('fs');
const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('ratelimit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
// sockets
const voiceSocket = require('./socket/voiceChat.socket');
// middleware
const universalMiddleware = require('./middleware/universalMiddleware');
// routes
const healthcheckRoutes = require('./routes/healthcheck.routes');
const musicRouter = require('./routes/apps/musicStreaming/music.routes');
const fileRouter = require('./routes/apps/fileUpload/fileUpload.routes');
const voiceChatRoutes = require('./routes/apps/voiceChat/voiceChat.routes');
const jwtauthRoutes = require('./routes/authentication/jwtauth.routes');
const todoRoutes = require('./routes/apps/todo/todo.routes');
const userRoutes = require('./routes/users/user.routes');
// utils
const AppError = require('./utils/appError');
// controllers
const globalErrorHandler = require('./controllers/errorController');
const authorizeMiddleware = require('./middleware/authorization/authorizeMiddleware');

const app = express();

const server = http.createServer(app);

// Set sequacity HTTP headers
app.use(helmet());

app.use(cookieParser());

// give info about request by clint
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    // create a write stream (in append mode)
    var accessLogStream = fs.createWriteStream(
        path.join(__dirname, '../logs', 'access.log'),
        { flags: 'a' }
    );

    // setup the logger
    app.use(morgan('combined', { stream: accessLogStream }));
}

app.use(express.json({ limit: '8mb' }));

// Serving static files
app.use(express.static(`${__dirname}/public`));
app.use(express.static(`${__dirname}/uploads`));

// CORS Middleware
app.use(
    cors({
        origin: ['*', 'http://localhost:3000'],
        credentials: true,
    })
);

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against xss
app.use(xssClean());

// custom middleware
app.use(universalMiddleware.sendTimeStamp);

// Sockets

voiceSocket(server);

// limiting IP address
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many request from this IP, pleas try again in an houre',
});
// FIXME:
// app.use('/api/*', limiter);

// Routes
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'ok',
    });
});

// health check
app.use('/health-check', healthcheckRoutes);

// admin
app.use('/api/v1/', userRoutes);

// auth
app.use('/api/v1/jwt', jwtauthRoutes);

// temp
app.use('/api/v1/voice-chat', voiceChatRoutes);

// apps Authorization Middleware
app.use(authorizeMiddleware.protect);
app.use(authorizeMiddleware.restrictToUrl);

// apps
app.use('/api/v1/todo', todoRoutes);
app.use('/api/v1/music', musicRouter);
app.use('/api/v1/files', fileRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = server;
