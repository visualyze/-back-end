'use strict';

require('dotenv').config();
require('./app.js').start(process.env.PORT || 3333);
