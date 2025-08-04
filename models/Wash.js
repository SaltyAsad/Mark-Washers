const mongoose = require('mongoose');

const washSchema = new mongoose.Schema({
  vehicleType: {
    type: String,
    enum: ['Car', 'Bike', 'Truck'],
    required: true
  },
  numberPlate: {
    type: String,
    required: true
  },
  tokenNumber: {
    type: String,
    required: true,
    unique: true
  },
  lane: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  washTime: {
    type: Number,
    required: true
  },
  entryTime: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed'],
    default: 'Pending'
  }
});

module.exports = mongoose.model('Wash', washSchema);