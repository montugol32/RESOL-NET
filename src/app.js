require('dotenv').config()
const express =require ("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const bcrypt =require("bcryptjs");
const cookieParser = require("cookie-parser");
//const auth = require("../src/middleware/auth");
 const {auth,authRole} = require("../src/middleware/auth");


require("./db/conn");
const Register=require("./models/register");
const Issue=require("./models/issue");

const port =process.env.PORT || 3000;

const static_path =path.join(__dirname,"../public");
const template_path =path.join(__dirname,"../templates/views");
const partials_path =path.join(__dirname,"../templates/partials");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extends:false}));


app.use(express.static(static_path));
app.set("view engine","hbs");
app.set("views",template_path);
hbs.registerPartials(partials_path);

app.get("/",(req,res)=>{  
    res.render("index");
});
app.get("/secret",auth, async (req,res,next)=>{  
    const issue = await Issue.find({reg_no:req.user.reg_no}).exec((err,issuedata)=>{
        if(issuedata){
            res.render("secret",{data:issuedata});
        }
    });
});
app.get("/loggedindex",auth, async (req,res,next)=>{  
    const issue = await Issue.find({reg_no:req.user.reg_no}).exec((err,issuedata)=>{
        if(issuedata){
            res.render("loggedindex",{data:issuedata});
        }
    });
});
app.post("/secret",auth,async (req,res)=>{
    try{
        const newIssue = new Issue({
            reg_no:req.user.reg_no,
            desc:req.body.desc,
            place:req.body.place
        });
        const issued = await newIssue.save();
        //res.status(201).render("secret");
        const issue = await Issue.find({reg_no:req.user.reg_no}).exec((err,issuedata)=>{
            if(issuedata){
                res.render("secret",{data:issuedata});
            }
        });
    }
    catch(error){
        res.status(400).send(error);
    }
});
app.get("/logout", auth,async(req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((currElement)=>{
            return currElement.token != req.token;
        });
        res.clearCookie("jwt");
        console.log("logout");
        await req.user.save();
        res.render("login");
    }
    catch(error){
        res.status(500).send(error);
    }
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
                confpassword:req.body.cpass,
                //role:"user"
            });
            const token = await registerUser.generateAuthToken();

            res.cookie("jwt",token,{
                httpOnly:true
            });
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
        res.cookie("jwt",token,{
            httpOnly:true,
            //secure:true
        });
        // console.log(pass);
        // console.log(userReg_no.password);
        if(isMatch){
            res.render("loggedindex");
        }
        else{
            res.send("invalid password");
        }
    }catch{
        res.status(400).send("invalid password");
    }
}); 

 app.get("/admin",auth,authRole('admin'),async(req,res)=>{  
     //res.render("admin");
     const issue = await Issue.find({$or: [ { statusofIssue:"unresolve" }, { statusofIssue:"panding" } ]}).sort({date: -1}).exec((err,issuedata)=>{
        if(issuedata){
            res.render("admin",{data:issuedata});
        }
    });
 });

 app.post("/unresolve",auth,authRole('admin'),async(req,res)=>{  
    //res.render("admin");
    try{
        const filter={_id:req.body.id};
        const update={statusofIssue:"unresolve"};
        let doc =await Issue.findOneAndUpdate(filter,update,{
            returnOriginal: false
        });
        const issue = await Issue.find({$or: [ { statusofIssue:"unresolve" }, { statusofIssue:"panding" } ]}).sort({date: -1}).exec((err,issuedata)=>{
            if(issuedata){
                res.render("admin",{data:issuedata});
            }
        });
    }
    catch(err){
        res.status(401).send(err);
    }
});
app.post("/panding",auth,authRole('admin'),async(req,res)=>{  
    //res.render("admin");
    try{
        const filter={_id:req.body.id};
        const update={statusofIssue:"panding"};
        console.log(req.body.id);
        let doc =await Issue.findOneAndUpdate(filter,update,{
            returnOriginal: false
        });
        const issue = await Issue.find({$or: [ { statusofIssue:"unresolve" }, { statusofIssue:"panding" } ]}).sort({date: -1}).exec((err,issuedata)=>{
            if(issuedata){
                res.render("admin",{data:issuedata});
            }
        });
    }
    catch(err){
        res.status(401).send(err);
    }
});

app.post("/done",auth,authRole('admin'),async(req,res)=>{  
    //res.render("admin");
    try{
        const filter={_id:req.body.id};
        const update={statusofIssue:"done"};
        console.log(req.body.id);
        let doc =await Issue.findOneAndUpdate(filter,update,{
            returnOriginal: false
        });
        const issue = await Issue.find({$or: [ { statusofIssue:"unresolve" }, { statusofIssue:"panding" } ]}).sort({date: -1}).exec((err,issuedata)=>{
            if(issuedata){
                res.render("admin",{data:issuedata});
            }
        });
    }
    catch(err){
        res.status(401).send(err);
    }
});
app.listen(port,()=>{
    console.log(`server is running ${port}`);
})