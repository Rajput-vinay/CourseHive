const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
        description:{
            type:String,
            required:true,
        },
        price:{
            type:Number,

        },
        imageUrl:{
            type:String,
        },
        creatorId:{
            type: mongoose.Schema.Types.ObjectId,
            ref:'admin'
        }
    
},{timestamps:true})

const courseModel = mongoose.model('course',courseSchema);

module.exports = {
    courseModel
}