const mongoose = require("mongoose");
const bcrypt =require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    reg_no:{
        type:Number,
    },
    email:{
        tpye:String,
        // unique:true
    },
    password:{
        type:String,
        required:true
    },
    confpassword:{
        type:String,
    },
    role:{
        type:String,
        default:"user"
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
});

//getting token
userSchema.methods.generateAuthToken = async function(){
    try{
        const token = jwt.sign({_id:this._id},process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token:token});
        await this.save();
        return token;
    }
    catch(error){
        res.send("error:"+error);
        console.log(error);
    }
}

//
userSchema.pre("save", async function(next){
    if(this.isModified("password")){
        //const passwordHash =await bcrypt.hash(this.pass,10);
        console.log(`this current password${this.password}`);
        this.password=await bcrypt.hash(this.password,10);
        console.log(`this current password${this.password}`);
        this.confpassword=await bcrypt.hash(this.password,10);
    }
    next();
});

const Register =new mongoose.model("user",userSchema);
module.exports=Register;