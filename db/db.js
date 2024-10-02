const mongoose = require('mongoose')

const dbConnect = async() =>{
    try {
        await mongoose.connect(process.env.DATABASE_URL)
        console.log("Successfully connect ")
    } catch (error) {
          console.log(error)
    }
}

module.exports = {
    dbConnect
}