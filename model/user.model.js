const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        unique:true,
        required:true

    },
    password:{
        type:String,
        
    },
    firstName:{
        type:String,
        required:true,
    },
    lastName:{
        type:String,
    }, 
    googleId:{
        type:String,
        unique:true,
        sparse:true,
    }
},{
    timestamps:true
})

const userModel = mongoose.model("User", userSchema);

module.exports = {
    userModel
}