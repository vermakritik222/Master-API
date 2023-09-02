const fs = require('fs');
const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { rateLimit } = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const YAML = require('yaml');
const swaggerUi = require('swagger-ui-express');

// sockets
const voiceSocket = require('./socket/voiceChat.socket');
// middleware
const universalMiddleware = require('./middleware/universalMiddleware');
const authorizeMiddleware = require('./middleware/authorize.middleware');
// routes
const healthcheckRoutes = require('./routes/healthcheck.routes');
const authRouter = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes'); 
const roomsRoutes = require('./routes/rooms.routes');

// utils
const AppError = require('./utils/appError');
// controllers
const globalErrorHandler = require('./controllers/errorController');

const file = fs.readFileSync(path.resolve(__dirname, './swagger.yaml'), 'utf8');
const swaggerDocument = YAML.parse(file);

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
    windowMs: 60 * 60 * 1000,
    max: 500,
    message: `There are too many requests. You are only allowed`,
});
app.use(limiter);

// Routes
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'ok',
    });
});

// API DOCS
app.use(
    '/doc',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
        swaggerOptions: {
            docExpansion: 'none',
        },
        customSiteTitle: 'API docs',
    })
);

// health check
app.use('/api/v1/health-check', healthcheckRoutes);

// Routes
app.use('/api/v1/auth', authRouter);

app.use(authorizeMiddleware.protect);

app.use('/api/v1/me', userRoutes);

// temp
app.use('/api/v1/rooms', roomsRoutes);


app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = server;
