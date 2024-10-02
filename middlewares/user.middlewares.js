const jwt = require('jsonwebtoken')

const userMiddleware = async (req, res, next) =>{

    const token = req.cookies.userToken||req.headers.token;
    if(!token){
        return res.status(400).json({
              message:"token not found"
        })
    }
    const decode = jwt.verify(token,process.env.JWT_SECRET_USER)

    if(!decode){
        return res.status(400).json({
            message:"user cannot sign"
        })
    }
   req.userId = decode.id
    next()
}

module.exports = {
    userMiddleware
}