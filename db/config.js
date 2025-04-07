import mysql from 'mysql2/promise';
import session from 'express-session';

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASS,
    database: process.env.DATABASE,
    namedPlaceholders: true
});

const express_session = session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 2 * 60 * 60 * 1000
    }
});

export { pool, express_session };