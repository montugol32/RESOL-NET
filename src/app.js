require('dotenv').config()
const express =require ("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const bcrypt =require("bcryptjs");

require("./db/conn");
const Register=require("./models/register");

const port =process.env.PORT || 3000;

const static_path =path.join(__dirname,"../public");
const template_path =path.join(__dirname,"../templates/views");
const partials_path =path.join(__dirname,"../templates/partials");

app.use(express.json());
app.use(express.urlencoded({extends:false}));


app.use(express.static(static_path));
app.set("view engine","hbs");
app.set("views",template_path);
hbs.registerPartials(partials_path);

app.get("/",(req,res)=>{  
    res.render("index");
});
app.get("/register",(req,res)=>{  
    res.render("register");
});
app.post("/register", async (req,res)=>{  
    try{
        const pass=req.body.pass;
        const cpass=req.body.cpass;
        if(pass===cpass){
            const registerUser  = new Register({
                reg_no:req.body.reg_no,
                email:req.body.email,
                password:req.body.pass,
                confpassword:req.body.cpass
            });
            const token = await registerUser.generateAuthToken();

            const registered=await registerUser.save();
            res.status(201).render("index");
        }else{
            res.send("password and confirm password not matching");
        }
    }
    catch(error){
        res.status(400).send(error);
    }
});
app.get("/login",(req,res)=>{  
    res.render("login");
}); 

//login chack
app.post("/login", async (req,res)=>{  
    try{
        const reg_no = req.body.reg_no;
        const pass = req.body.pass;

        const userReg_no= await Register.findOne({reg_no:reg_no});
        const isMatch = await bcrypt.compare(pass,userReg_no.password);
        const token = await userReg_no.generateAuthToken();
        // console.log(pass);
        // console.log(userReg_no.password);
        if(isMatch){
            res.render("index");
        }
        else{
            res.send("invalid password");
        }
    }catch{
        res.status(400).send("invalid password");
    }
}); 

app.listen(port,()=>{
    console.log(`server is running ${port}`);
})