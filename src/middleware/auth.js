const jwt = require("jsonwebtoken");
const Register = require("../models/register");

const auth = async (req,res,next) =>{
    try{
        const token = req.cookies.jwt;
        const verifyUser = jwt.verify(token,process.env.SECRET_KEY);
        console.log(verifyUser);
        const user = await Register.findOne({_id:verifyUser._id});
        console.log(user.reg_no);

        req.token=token;
        req.user=user;
        next();
    }catch(error){
        res.status(401).send(error);
    }
}
function authRole(role){
    return async (req,res,next)=>{
        const token = req.cookies.jwt;
        const verifyUser = jwt.verify(token,process.env.SECRET_KEY);
        //console.log(verifyUser);
        const user = await Register.findOne({_id:verifyUser._id});
        //console.log(user.reg_no);

        req.token=token;
        req.user=user;
        if(req.user.role!=role){
            res.status(401)
            return res.send("Not Allowed");
        }
        next();
    }
}
//module.exports=auth;
 module.exports={
     auth,
     authRole
 }