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

async function searchKep(req,res) {
    cloudinary.search
    .expression('resource_type:image AND folder:kepek')
    .sort_by('public_id','desc')
    .max_results(30)
    .execute()
    .then(result => {
        let kepek=[];
        for(let rs of result.resources) kepek.push({publicId:rs.public_id,url:rs.secure_url});
        
        res.send(kepek)})
    
}

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
    cloudinary.uploader.upload_stream({resource_type:'auto',public_id:req.body.id,asset_folder:"PlateShare/etelek"},(error,result) => {
        if(error) {
            console.log(error)
            return res.status(500).json({error:'Error uploading to Cloudinary'});
        }
        res.json({public_id:result.public_id,url:result.secure_url});
    }).end(req.file.buffer);

}

async function delKep(req,res) {
    if(req.body.publicId) {
        const result  = await cloudinary.uploader.destroy(req.body.publicId);
        res.send(result);
    } else{res.status(400).send({error:"Hibás paraméterek!"})};
}

app.get('/', (req, resp) => resp.send('Élelmiszermentő platform v1.0.0'));
app.get("/search",searchKep);
app.post("/pfp",upload.single("fajl"),uploadpfp);
app.post("/etel",upload.single("fajl"),uploadetel);
app.delete("/del",delKep);

app.listen(88, (error) => {
    console.log(error ? error : "Server on port 88");
});