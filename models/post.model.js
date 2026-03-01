import mongoose from "mongoose";

const postSchema = mongoose.Schema({
   createdBy :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    createdAt :{
        type : Date,
        default: Date.now()
    },
    content : {
        type : String
    },
    likes :[
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
        }
    ]
    
})

export default mongoose.model("Post" , postSchema);