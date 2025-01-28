const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const analysisRouter = require('./route/analysisRoute.js');

const app = express();
const PORT = process.env.PORT || 5000;