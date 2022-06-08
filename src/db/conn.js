const mongoose=require("mongoose");
mongoose.connect("mongodb://localhost:27017/userRegistration").then(()=>{
    console.log(`connection succesful`);
}).catch((e)=>{
    console.log(`no connection`);
})