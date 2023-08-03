// const mongoose = require('mongoose');
require('dotenv'); // for environment veritable
const dbConfig = require('./config/dbConfig'); // for environment veritable

const app = require('./app');

// process.on('uncaughtException', (err) => {
//     console.log(log.danger, 'UNCAUGHT EXCEPTION! 💥 Shutting down...');
//     console.log(err.name, err.message);
//     process.exit(1);
// });

// const DB = process.env.DATABASE.replace(
//     '<PASSWORD>',
//     process.env.DATABASE_PASSWORD
// );

// mongoose
//     .connect(dbConfig.DB, {
//         useNewUrlParser: true,
//         useCreateIndex: true,
//         useFindAndModify: false,
//         useUnifiedTopology: true, // to remove error/ working on consol
//     })
//     .then(() => {
//         console.log('DB is connected to app.....');
//     })
//     .catch((err) => {
//         console.log(`db error ${err.message}`);
//     });

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
    console.log(`server is running on ${port} .......`);
});

// process.on('unhandledRejection', (err) => {
//     //FIXME: something is wrong
//     console.log(log.danger, 'UNHANDLED REJECTION! 💥 Shutting down...');
//     console.log(err.name, err.message);
//     server.close(() => {
//         process.exit(1);
//     });
// });
