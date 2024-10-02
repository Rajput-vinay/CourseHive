const jwt = require('jsonwebtoken')

const adminMiddleware = async (req, res, next) =>{
console.log(req.cookies.adminToken)
    const token = req.cookies.adminToken||req.headers.token;
    
    if(!token){
        return res.status(400).json({
              message:"token not found"
        })
    }

    const decode =  jwt.verify(token,process.env.JWT_SECRET_ADMIN)

    if(!decode){
        return res.status(4000).json({
            message:"user cannot sign"
        })
    }
   req.adminId = decode.id
    next()
}

module.exports = {
    adminMiddleware
}