import path from 'node:path';
import express from 'express';
import cookieParser from 'cookie-parser';

import { express_session } from './db/config.js';
import router from './routes/common.router.js';

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(import.meta.dirname, 'views'));

app.use(express_session);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

app.use('/api/v1', router);


app.listen(process.env.PORT, () => {
    console.log(`server running @${process.env.PORT}`);
})