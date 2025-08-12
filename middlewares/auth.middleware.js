const  apierror = require("../utils/apierror.js")
const  asynchandler = require("../utils/asynchandler.js")
const  jwt = require("jsonwebtoken")
const User = require("../models/User.js")
const urlencoded = require("body-parser").urlencoded

 const verifyJWT =asynchandler(async(req,_,next) => {
    try {
        const token = req.cookies?.accesstoken || req.header("Authorization")?.replace("Bearer ","" )
       
        
    
        if (!token) {
            throw new apierror(401,"Unauthorized Request")
        }
    
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshtoken")
    
        if (!user) {
            throw new apierror(401,"Invalid Access Token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new apierror(401,error?.message || "Invalid Access Token")
    }

})
module.exports = { verifyJWT }
