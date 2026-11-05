const jwt = require("jsonwebtoken");
const { findUserById } = require("../models/userModel");
require("dotenv").config();

async function authenticate (req,res,next){
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({
            message: "Authentication token required"
        });
    }

    const token = authHeader.split(" ")[1];
    let payload;
    let user;
    try{
        payload = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
    }catch(err){
        return res.status(401).json({
            message: "Invalid or expired token"
        }); 
    }

    try{

        user = await findUserById(payload.sub);

    }catch(err){
        return res.status(500).json({
            message: "Internal server error"
        });
    }

    if(!user){
        return res.status(401).json({
            message: "Unauthorized"
        });
    }
    
    if(user.status === "disabled"){
        return res.status(403).json({
            message: "Forbidden"
        });
    }
    req.user = {
        id: user.id,
        role: user.role
    };
    
    return next();

}

module.exports = authenticate;