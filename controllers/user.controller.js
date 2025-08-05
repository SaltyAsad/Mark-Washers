const Wash = require('../models/Wash.js');
const User = require('../models/User.js');
const apierror = require('../utils/apierror.js');
const apiresponse = require('../utils/apiresponse.js');
const asynchandler = require('../utils/asynchandler.js');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const generateAccessAndRefreshTokens = async(userid) => {
    
    
    try {
        const user = await User.findById(userid)
        // console.log(user);
        // console.log("user id",userid);
        const accesstoken = user.generateAccessToken()
        //console.log("accesstoken",accesstoken);
        const refreshtoken = user.generateRefToken()
        //console.log("refreshtoken",refreshtoken);
        

        user.refreshtoken=refreshtoken
        await user.save({ validateBeforeSave: false })

        return {accesstoken,refreshtoken}

    } catch (error) {
        throw new apierror(500,error?.message)
    }
}

const registerUser = asynchandler( async (req,res) => {
    
    const {email,password} = req.body

    const existedUser = await User.findOne({email});

    if (existedUser) {
        throw new apierror(409,"User already exists")
    }

    const createdUser = await User.create({
          email,
          password
        });

    if (!createdUser) {
      throw new apierror(500,"Something went wrong while creating the User")

    }

    return res.status(201).json(
        new apiresponse(200, createdUser,"User Registered Successfully")
    )

})

const loginUser = asynchandler(async (req,res) => {
    try {
    const { email, password } = req.body;
    if (!(password || email)) {
        throw new apierror(400,"password and email is required")
    }
    const user = await User.findOne({email});
   // console.log("ye user ki email",user);

    if (!user) {
        throw new apierror(404,"User does not exist")
    }

    const ispassswordvalid = await user.ispasswordcorrect(password)

     if (!ispassswordvalid) {
        throw new apierror(401,"Invalid Password")
    }
    
    const {accesstoken,refreshtoken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshtoken")

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .cookie("accesstoken",accesstoken,options)
    .cookie("refreshtoken",refreshtoken,options)
    .json(
        new apiresponse(
            200,
            {
                user: loggedInUser,
                accesstoken,
                refreshtoken
            },
            "User Logged In Successfully"
        )   
    )

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
})

module.exports = {registerUser,loginUser,generateAccessAndRefreshTokens};

/*
    
    
*/