import User from "../models/user.model.js";
import jwt from 'jsonwebtoken'

export const protectedRoute = async (req,res,next) => {
    try {
        const token = req.cookies.token;
        if(!token ){
            res.status(404).json({
                message : " Unauthorized : token is required"
            })
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        if(!decoded) {
            res.status(403).json({
                message : " Unauthorized : token is invalid"
            })
        }

        const user = await User.findById(decoded.userId).select("-password")
        if(!user){
            res.status(401).json({
                message: "User not found"
            })
        }
        req.user = user
        next()
    } catch (error) {
        res.status(500).json({
            message: " Internal server error"
        })
        console.log("Problem in protectedRoute middleware",error.message)
    }
}