import express from 'express';
import cors from 'cors';
import multer from "multer";
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLUDINARY_CLOUD_NAME,
  api_key: process.env.CLUDINARY_API_KEY,
  api_secret: process.env.CLUDINARY_API_SECRET,
  secure: true,
});

const storage=multer.memoryStorage();
const upload = multer({storage:storage}); 

const app = express();
app.use(express.json());
app.use(cors());


function uploadpfp(req,res) {
    console.log(req.file);
    const publicID = req.body.publicID;
    console.log("PublicID:"+publicID);
    cloudinary.uploader.upload_stream({resource_type:'auto',public_id:publicID,asset_folder:"PlateShare/users"},(error,result) => {
        if(error) {
            console.log(error)
            return res.status(500).json({error:'Error uploading to Cloudinary'});
        }
        console.log(result);
        res.json({public_id:(publicID == "" ? result.public_id:publicID),url:result.secure_url});
    }).end(req.file.buffer);

}

function uploadetel(req,res) {
    console.log(req.file);
    const publicID = req.body.publicID;
    cloudinary.uploader.upload_stream({resource_type:'auto',public_id:publicID,asset_folder:"PlateShare/etelek"},(error,result) => {
        if(error) {
            console.log(error)
            return res.status(500).json({error:'Error uploading to Cloudinary'});
        }
        res.json({public_id:(publicID == "" ? result.public_id:publicID),url:result.secure_url});
    }).end(req.file.buffer);

}

function uploadrecept(req,res) {
    console.log(req.file);
    const publicID = req.body.publicID;
    cloudinary.uploader.upload_stream({resource_type:'auto',public_id:publicID,asset_folder:"PlateShare/receptek"},(error,result) => {
        if(error) {
            console.log(error)
            return res.status(500).json({error:'Error uploading to Cloudinary'});
        }
        res.json({public_id:(publicID == "" ? result.public_id:publicID),url:result.secure_url});
    }).end(req.file.buffer);

}

async function delKep(req,res) {
    if(req.params.publicId) {
        const result  = await cloudinary.uploader.destroy(req.params.publicId);
        res.send(result);
    } else{
        console.log("Hibás paraméterek!");
        res.status(400).send({error:"Hibás paraméterek!"})};
}

app.get('/', (req, resp) => resp.send('Élelmiszermentő platform v1.0.0'));
app.post("/pfp",upload.single("fajl"),uploadpfp);
app.post("/etel",upload.single("fajl"),uploadetel);
app.post("/recept",upload.single("fajl"),uploadrecept);
app.delete("/del/:publicId",delKep);

app.listen(88, (error) => {
    console.log(error ? error : "Server on port 88");
});