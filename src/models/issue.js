const mongoose = require("mongoose");

const userIssueSchema = new mongoose.Schema({
    reg_no:{
        type:Number,
    },
    desc:{
        type:String
    },
    place:{
        type:String
    },
    date:{
        type:Date,
        default:Date.now
    },
    statusofIssue:{
        type:String,
        default:"unresolve"
    }
});

const Issue =new mongoose.model("issue",userIssueSchema);
module.exports=Issue;