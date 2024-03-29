import http from 'http';
import express from 'express';
import mongoose from 'mongoose';
import router from './router/routes.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express(),
    server = http.createServer(app),
    port = 5000;

//---------------- express static
app.use(express.static(__dirname));
app.use('/', express.static(__dirname + '/public/templates'));
app.use('/public', express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/public/templates'));
app.use(express.json());

// ------------  routes --------
app.use('/', router);

//---------------- error and 404
// eslint-disable-next-line no-unused-vars
app.use((err,req,  res, next) => {
    console.log('============================');
    console.log(err.message)
    const isNotFound = ~err.message.indexOf('not found');
    const isCastError = ~err.message.indexOf('Cast to ObjectId failed');
    const isNoSuchFile = ~err.message.indexOf('ENOENT: no such file');

    if (err.message && (isNotFound || isCastError || isNoSuchFile)) {
        return next(err);
    }
    console.log(err.stack);
    res.status(404).json({ Error: err.stack });
});
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    if (err) res.status(404).type('text/html').send('<h2> Not found 404</h2>');
});

app.get('*', function(req, res) {
    res.status(404).type('text/html').send('<h2> Not found 404</h2>');
});

// ------------  mongoose --------
mongoose.connect('mongodb+srv://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@cluster0.qy6hg4h.mongodb.net/' + process.env.DB_NAME + '?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true }, (error) => {
    if (error) {
        return console.log('error connect mongoose DB' + error);
    }

    server.on('error',  (error) => {
        console.log('Mongoose default connection error: ' + error);
    });

    server.listen(process.env.PORT || port, () => {
        console.log(`Server is run on port ${process.env.PORT || port}`);
        console.log('Mongoose connection successful');
    });
});
