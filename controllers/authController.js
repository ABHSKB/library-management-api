const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { findUserByEmail, createUser, findUserById } = require("../models/userModel");

async function registration(req,res) {
    try{
        if (
            !req.body ||
            typeof req.body !== "object" ||
            Array.isArray(req.body)
        ) {
            return res.status(400).json({
                message: "Invalid request body"
            });
        }
        const {name, email, password } = req.body;

        if(
             typeof name === "string" &&name.trim() &&
             typeof email === "string" &&email.trim() &&
             typeof password === "string" && password.trim() && password.length >= 8
        ){
            const names = name.trim();
            const emails =  email.trim().toLowerCase();
            const existEmail = await  findUserByEmail(emails);

            if(!existEmail){
                const hashedPassword = await bcrypt.hash(password,10);
                const role = "member";
                const status = "active";
                const result = await createUser(names, emails, hashedPassword, role , status );
                return res.status(201).json({
                    message: "successfully created",
                    userId: result
                });
            }else{
                return res.status(409).json({
                    message: "email exist"
                });     
            }
        }else{
            return res.status(400).json({
                message: "Invalid input"
            });
        }
    }catch(err){

        if(err.code === "ER_DUP_ENTRY"){
            return res.status(409).json({
                    message: "email exist"
                }); 
        }else{
            console.log(err);
            return res.status(500).json({
                message: "server error"
            });
        }
        
    }
}

async function login(req,res) {
    try{
        const {email, password} = req.body;

        if(
            typeof email !== "string" || !email.trim() ||
            typeof password !== "string" || !password
        ){
            return res.status(400).json({
                message: "email and password required"
            });
        }

        const user = await findUserByEmail(email.trim().toLowerCase());
        if(!user){
            return  res.status(401).json({
                message: "Invalid email or password"
            });

        }

        if(user.status === "disabled"){
            return  res.status(403).json({
                message: "Disabled account"
            });
        }
        const isMatch = await bcrypt.compare(password,user.password);

        if(!isMatch){
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            { role: user.role },
            process.env.JWT_SECRET,
            {
                subject: String(user.id),
                expiresIn: "1h"
            }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                role: user.role
            }
        });
    }catch(err){
        console.error(err);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
    
}

async function getMe(req, res) {

    try{
        const id = req.user.id;

        const user = await findUserById(id);

        if(!user){
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        return res.status(200).json({
                message: "User found",
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
            });
    }catch(err){
        return res.status(500).json({
            message: "Internal server error"
        });
    }
    
}

module.exports = {registration, login, getMe};