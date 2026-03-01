import jwt from "jsonwebtoken"

function isLoggedIn(req , res , next){
    if(req.cookies.token === "") res.send("You need to log in first");
    else{
        let data = jwt.verify(req.cookies.token , process.env.JWT_SECRET_KEY);
        req.user = data;
    }
    next();
}

export {
    isLoggedIn
}