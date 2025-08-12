const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const washRoutes = require('./routes/washRoutes');

const app = express();

app.use(cors());
app.use(express.json());
// app.use(express.static('public'));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api', washRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});