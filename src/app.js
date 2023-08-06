const express = require('express');
const cors = require('cors');
const universalMiddleware = require('./middleware/universalMiddleware');
const healthcheckRoutes = require('./routes/healthcheck.routes');
const musicRouter = require('./routes/music.routes');
const fileRouter = require('./routes/fileUpload.routes');
const hlsStreamRouter = require('./routes/hlsStream.routes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const jwtauthRoutes = require('./routes/jwtauth.routes');
const userRoutes = require('./routes/user.routes');

const app = express();

// build is express // body parser ,reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.json());

// Serving static files
app.use(express.static(`${__dirname}/public`));

// CORS Middleware
app.use(
    cors({
        origin: '*',
        credentials: true,
    })
);

// use to send time // Testing middleware
app.use(universalMiddleware.sendTimeStamp);

// Routes
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'ok',
    });
});

app.use('/health-check', healthcheckRoutes);
app.use('/api/v1/', userRoutes);
app.use('/api/v1/jwt', jwtauthRoutes);
app.use('/api/v1/music', musicRouter);
app.use('/api/v1/files', fileRouter);
app.use('/api/v1/hsl', hlsStreamRouter);

app.all('*', (req, res, next) => {
    // best method
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);
module.exports = app;
