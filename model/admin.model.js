const mongoose = require('mongoose')

const adminSchema = new mongoose.Schema({
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
        unique:true, // Ensures each google account is linked to one admin
        sparse:true // Allows null value if user signs up without goole
    }
},{
    timestamps:true
})


const adminModel = mongoose.model("admin",adminSchema)

module.exports = {
    adminModel
}