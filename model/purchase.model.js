const mongoose = require("mongoose")


const purchaseSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
    },
        coursePurchase:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"course"
        }
    
},{timestamps:true})

const purchaseModel = mongoose.model("purchase",purchaseSchema)

module.exports ={
    purchaseModel
}