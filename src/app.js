const express = require('express');
const universalMiddleware = require('./middleware/universalMiddleware'); 
const musicRouter = require('./routes/musicRouter'); 

const app = express();

// build is express // body parser ,reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.json());

// Serving static files
app.use(express.static(`${__dirname}/public`));

// use to send time // Testing middleware
app.use(universalMiddleware.sendTimeStamp);

// Routes
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'ok',
    });
});

app.use('/api/v1/music', musicRouter);
// app.use('/api/v1/user', userRouter);
// app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
    // not used in production original apps
    res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on this server!`,
    });

    // not a recommended way
    // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
    // err.statusCode(404);
    // err.status('fail');

    // best method
    // next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// app.use(globelErrorHandlear);
module.exports = app;
