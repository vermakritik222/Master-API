const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
// sockets
const voiceSocket = require('./socket/voiceChat.socket');
// middleware
const universalMiddleware = require('./middleware/universalMiddleware');
// routes
const healthcheckRoutes = require('./routes/healthcheck.routes');
const musicRouter = require('./routes/apps/musicStreaming/music.routes');
const fileRouter = require('./routes/apps/fileUpload/fileUpload.routes');
const voiceChatRoutes = require('./routes/apps/voiceChat/voiceChat.routes');
// const hlsStreamRouter = require('./routes/apps/musicStreaming/hlsStream.routes');
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

app.use(cookieParser());

app.use(express.json({ limit: '8mb' }));
app.use(express.json());

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

// custom middleware
app.use(universalMiddleware.sendTimeStamp);

// Sockets

voiceSocket(server);

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
// app.use('/api/v1/hsl', hlsStreamRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = server;
