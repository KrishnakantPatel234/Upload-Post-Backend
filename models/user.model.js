import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    username :{
        type : String,
        required : true
    },
    name :{
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true,
        min : 6
    },
    age : Number,
    profilepic : {
        type : String,
        default : "default-person.png"
    },
    posts : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Post"
         }
    ]
})

export default mongoose.model("User" , userSchema);


