const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const washSchema = new mongoose.Schema({
  user: {
        type: Schema.Types.ObjectId,
        ref: "User"
  },
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

//ask userid or phir front kese chalega 
// claude ask public folder me login ka or index me swithcing kese kearni