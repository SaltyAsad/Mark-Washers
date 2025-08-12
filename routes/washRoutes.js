const express = require('express');
const router = express.Router();
const Wash = require('../models/Wash.js');
const User = require('../models/User.js');
const apierror = require('../utils/apierror.js');
const apiresponse = require('../utils/apiresponse.js');
const asynchandler = require('../utils/asynchandler.js');
const mongoose = require('mongoose');
const  verifyJWT  = require('../middlewares/auth.middleware.js').verifyJWT;
const registerUser = require('../controllers/user.controller.js').registerUser;
const loginUser = require('../controllers/user.controller.js').loginUser;
const logOutUser = require('../controllers/user.controller.js').logOutUser;

let tokenCounter = 5000;
let laneAssignment = 1;

const vehicleConfig = {
  'Car': { time: 15, price: 500 },
  'Bike': { time: 10, price: 300 },
  'Truck': { time: 20, price: 800 }
};

router.post('/wash',verifyJWT, async (req, res) => {
  try {
 //   console.log("working");2 bhj ke check
    
    const { vehicleType, numberPlate } = req.body;
    
    const tokenNumber = `T${tokenCounter++}`;
    const lane = laneAssignment;
    laneAssignment = laneAssignment === 3 ? 1 : laneAssignment + 1;
    
    const config = vehicleConfig[vehicleType];
    
    const wash = new Wash({
      user: req.user._id, 
      vehicleType,
      numberPlate,
      tokenNumber,
      lane,
      price: config.price,
      washTime: config.time
    });
    
    wash.save();
    res.status(201).json(wash);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/user-wash',verifyJWT, async (req, res) => {
  try {
  //  console.log("Fetching user washes",res);
    
    const user = req.user._id
    console.log("user id", user);
    
    const washes = await Wash.find({user}).sort({ entryTime: -1 });
    res.json(washes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/testRoute', async (req, res) => {
  try {
    // const washes = await Wash.find().sort({ entryTime: -1 });
    res.json({ message: 'Welcome to Home from Backend' });
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

router.route("/user/login").post(loginUser) // changed GET > POST

router.route("/user/register").post(registerUser)

router.route("/user/logout").post(verifyJWT,logOutUser)

module.exports = router;