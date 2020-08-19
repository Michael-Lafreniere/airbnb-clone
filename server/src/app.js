const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

require('dotenv').config();

const middleware = require('./middleware');
const routes = require('./routes');

const app = express();
app.set('trust proxy', 1);

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

// Setup the routes:
app.use('/', routes);

// Middleware to handle not found and errors (from try/catch blocks):
app.use(middleware.notFound);
app.use(middleware.errorHandler);

module.exports = app;
