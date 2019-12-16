'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require(`./middleware/500.js`);
const notFound = require(`./middleware/404.js`);
const apiRoutes = require(`./routes/api.js`);

// Prepare the express app
const app = express();

// App Level MW
app.use(cors());
app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use(apiRoutes);

// Catchalls
app.use(notFound);
app.use(errorHandler);

let start = (port = process.env.PORT) => {
  app.listen(port, () => {
    console.log(`Server Up on ${port}`);
  });
};

module.exports = { app, start };
