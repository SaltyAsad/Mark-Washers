//import { auth.middleware } from '../middleware/auth';
const express = require('express');
const router = express.Router();
const Wash = require('../models/Wash');

let tokenCounter = 1000;
let laneAssignment = 1;

const vehicleConfig = {
  'Car': { time: 15, price: 500 },
  'Bike': { time: 10, price: 300 },
  'Truck': { time: 20, price: 800 }
};

router.post('/wash', async (req, res) => {
  try {
    const { vehicleType, numberPlate } = req.body;
    
    const tokenNumber = `T${tokenCounter++}`;
    const lane = laneAssignment;
    laneAssignment = laneAssignment === 3 ? 1 : laneAssignment + 1;
    
    const config = vehicleConfig[vehicleType];
    
    const wash = new Wash({
      vehicleType,
      numberPlate,
      tokenNumber,
      lane,
      price: config.price,
      washTime: config.time
    });
    
    await wash.save();
    res.status(201).json(wash);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/wash', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const washes = await Wash.find(filter).sort({ entryTime: -1 });
    res.json(washes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.patch('/wash/:id/complete', async (req, res) => {
  try {
    const wash = await Wash.findByIdAndUpdate(
      req.params.id,
      { status: 'Completed' },
      { new: true }
    );
    if (!wash) {
      return res.status(404).json({ error: 'Wash not found' });
    }
    res.json(wash);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/wash/:id/receipt', async (req, res) => {
  try {
    const wash = await Wash.findById(req.params.id);
    if (!wash || wash.status !== 'Completed') {
      return res.status(404).json({ error: 'Receipt not available' });
    }
    
    const finishTime = new Date(wash.entryTime.getTime() + wash.washTime * 60000);
    
    res.json({
      vehicleNumber: wash.numberPlate,
      type: wash.vehicleType,
      tokenNumber: wash.tokenNumber,
      lane: wash.lane,
      totalPrice: wash.price,
      washStartTime: wash.entryTime,
      washFinishTime: finishTime
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;