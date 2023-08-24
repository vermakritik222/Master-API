const mongoose = require('mongoose');
require('dotenv').config();
const dbConfig = require('./config/dbConfig');

const server = require('./app');

process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

mongoose
    .connect(dbConfig.DB, {
        useNewUrlParser: true,
        // useCreateIndex: true,
        // useFindAndModify: false,
        useUnifiedTopology: true, // to remove error/ working on consol
    })
    .then(() => {
        console.log('DB is connected to app.....');
    })
    .catch((err) => {
        console.log(`db error ${err.message}`);
    });

const port = process.env.PORT || 8080;
const serverInstance = server.listen(port, () => {
    console.log(`server is running on ${port} .......`);
});

process.on('unhandledRejection', (err) => {
    //FIXME: something is wrong
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    serverInstance.close(() => {
        process.exit(1);
    });
});
