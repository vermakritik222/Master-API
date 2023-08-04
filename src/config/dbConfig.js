let DB;

if (process.env.NODE_ENV === 'development') {
    DB = process.env.DEV_DATABASE.replace(
        '<PASSWORD>',
        process.env.DEV_DATABASE_PASSWORD
    );
}
if (process.env.NODE_ENV === 'production') {
    DB = process.env.DATABASE.replace(
        '<PASSWORD>',
        process.env.DATABASE_PASSWORD
    );
}

module.exports = { DB };
