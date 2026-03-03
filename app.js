import express, { urlencoded } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import User from "./models/user.model.js";
import Post from "./models/post.model.js";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import crypto from "crypto";

// import middlewares
import { isLoggedIn } from "./middlewares/auth.middleware.js";
import connectDB from "./db/db.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.set("view engine" , "ejs");
app.use(express.json()) // this line is used so that data send by user to the backend i not rejected
app.use(express.urlencoded({extended : true}));
app.use(cookieParser());

const storage = multer.diskStorage({
    destination : (req , file , cb)=> {
        cb(null , "./public/images/uploads");
    },
    filename : (req , file , cb) => {
        crypto.randomBytes(12 , function(err , bytes){
            const randomHex = bytes.toString("hex");

            const originalName = path.parse(file.originalname).name;
            const extension = path.extname(file.originalname);

            const filename = `${originalName}-${randomHex}${extension}`;
            cb(null , filename);
        })
    }
})

const upload = multer({storage : storage});

app.get("/" , (req , res) => {
    res.render("index")
})

app.get("/login" , (req , res) => {
    res.render("login")
})

app.post("/register" , async (req , res) => {
    const {username , email , password , age , name} = req.body;

    let user = await User.findOne({email});

    if(user){
        return res.status(400).send("User already registered")
    }

    if (!email || !password) {
        return res.status(400).send("Email and password required");
    }

    const hashedPass = await bcrypt.hash(password , 10);

    user = await User.create({
        username,
        name,
        email , 
        age,
        password : hashedPass,
    });

    let token = jwt.sign(
        {email : email , userId : user._id},
        process.env.JWT_SECRET_KEY,
        {expiresIn : "1d"}
    );

    res.cookie("token" , token , {httpOnly : true});

    res.redirect("profile")
    
})

app.post("/login" , async (req , res) => {
    const {email , password} = req.body;

    let user = await User.findOne({email});

    if(!user){
        return res.status(404).send("User does not exist kindly regiter first...");
    }

    let matchPassword = await bcrypt.compare(password , user.password);

    if(!matchPassword){
        res.redirect("login");
    }

    let token = jwt.sign(
        {email : email , userId : user._id},
        process.env.JWT_SECRET_KEY,
        {expiresIn : "1d"}
    );

    res.cookie("token" , token , {httpOnly : true});

    return res
        .status(201)
        .redirect("profile");
})

app.get("/logout" , (req , res) => {
    res.cookie("token" , "");
    res.redirect("login");
})

app.get("/profile" , isLoggedIn , async (req , res)=> {
    const user = await User.findOne({email : req.user.email}).populate("posts");    
    res.render("profile" , {user})
})

app.post("/post" , isLoggedIn , async (req , res)=> {
    const {content} = req.body;

    const user = await User.findOne({email : req.user.email});

    let post = await Post.create({
        createdBy : user._id,
        content
    });

    user.posts.push(post._id);
    await user.save();

    res.redirect("profile");
})

app.get("/like/:id" , isLoggedIn , async (req , res) => {
    const {id} = req.params;
    const post = await Post.findOne({_id : id}).populate("createdBy");

    if(post.likes.indexOf(req.user.userId) === -1){
        post.likes.push(req.user.userId);           // Add like if user ne like na kiya ho to 
    }
    else{
        post.likes.splice(post.likes.indexOf(req.user.userId), 1);           // unlike agar user ne like kiya ho to
    }

    await post.save();          // save nahi kiya to realtime update hi nahi hoga
    res.redirect("/profile");
    // post.likes.push(req.user.userid)
})

//get the post that needs to be updated
app.get("/edit/:id" , isLoggedIn , async (req , res) => {
    const {id} = req.params;
    const post = await Post.findOne({_id : id}).populate("createdBy");
    res.render("edit" , {post});
})

// update the post by findOneAndUpdate
app.post("/update/:id" , isLoggedIn , async (req , res) => {
    const {id} = req.params;
    const {content} = req.body;
    
    const post = await Post.findOneAndUpdate({_id : id} , {content : content});
    res.redirect("/profile");
})

app.get("/test", (req , res) => {
    res.render("test");
})

app.post("/upload" ,isLoggedIn  , upload.single("image") , (req , res) => {
    console.log(req.file);
})

app.listen(PORT , ()=> {
    console.log(`Listening on port ${PORT}`)
})