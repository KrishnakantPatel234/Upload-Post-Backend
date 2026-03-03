import multer from "multer";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

// Create __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination : function(req , file , cb){
        cb(null, path.join(__dirname, "../public/images/uploads"));
        // agar public ke samne "/" laga diya to directory c: se start hogi => c:/public/images/uploads which is wrong
    },
    filename : function(req , file ,cb){
        crypto.randomBytes(12 , function(err , bytes){
            const randomhex = bytes.toString("hex");

            const originalName = path.parse(file.originalname).name;
            const extension = path.extname(file.originalname);

            const fileName = `${originalName}-${randomhex}${extension}`;
            cb(null , fileName);
        })
    }
})

const upload = multer({storage : storage});

export default upload;