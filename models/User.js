const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
 
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    refreshtoken: {
        type: String,
    }
});

userSchema.pre("save",async function(next) {
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.ispasswordcorrect = async function(password){
   return await bcrypt.compare(password,this.password)
}

module.exports = mongoose.model('User', userSchema);

/*" "email" :"here@gmail.com",
    "password":"1234567"

    "email" :"asad@gmail.com",
    "password":"1234"
    
    */
    
