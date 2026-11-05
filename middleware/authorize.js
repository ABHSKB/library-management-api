
function authorize(roles) {
    return (req, res, next) =>{
        if(!req.user){
            return res.status(401).json({
                message: "user not found"
            });
        }

        if(!roles.includes(req.user.role)){
            return res.status(403).json({
                message: "forbidden"
            });
        }

        next();

    }
    
}

module.exports = authorize;