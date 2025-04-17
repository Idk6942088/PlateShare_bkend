import express from 'express';
import cors from 'cors';
import multer from "multer";
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLUDINARY_CLOUD_NAME,
  api_key: process.env.CLUDINARY_API_KEY,
  api_secret: process.env.CLUDINARY_API_SECRET,
  secure: true,
});

// Express app setup
const app = express();
app.use(express.json());
app.use(cors());

// Multer setup
const storage = typeof multer.memoryStorage === 'function' 
  ? multer.memoryStorage() 
  : { _handleFile: () => {}, _removeFile: () => {} };
const upload = multer({ storage });


// Segédfüggvények
const handleUpload = (req, res, assetFolder) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const publicID = req.body.publicID || '';
  cloudinary.uploader.upload_stream(
    {
      resource_type: 'auto',
      public_id: publicID,
      asset_folder: assetFolder
    },
    (error, result) => {
      if (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ error: 'Error uploading to Cloudinary' });
      }
      res.json({
        public_id: publicID || result.public_id,
        url: result.secure_url
      });
    }
  ).end(req.file.buffer);
};

// Végpontok
export const uploadpfp = (req, res) => {
  handleUpload(req, res, "PlateShare/users");
};

export const uploadetel = (req, res) => {
  handleUpload(req, res, "PlateShare/etelek");
};

export const uploadrecept = (req, res) => {
  handleUpload(req, res, "PlateShare/receptek");
};

export const delKep = async (req, res) => {
  if (!req.params.publicId) {
    return res.status(400).json({ error: "Hibás paraméterek!" });
  }
  
  try {
    const result = await cloudinary.uploader.destroy(req.params.publicId);
    res.json(result);
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Error deleting from Cloudinary' });
  }
};

// Útvonalak
app.get('/', (req, res) => res.send('Élelmiszermentő platform v1.0.0'));
app.post("/pfp", upload.single("fajl"), uploadpfp);
app.post("/etel", upload.single("fajl"), uploadetel);
app.post("/recept", upload.single("fajl"), uploadrecept);
app.delete("/del/:publicId", delKep);

// Szerver indítása csak akkor, ha nem tesztkörnyezetben vagyunk
const startServer = () => {
    const PORT = process.env.PORT || 3000;
    return app.listen(PORT, (error) => {
      console.log(error ? error : `Server on port ${PORT}`);
    });
  };
  
  // Export only once
  export { app };
  
  // Start server only if not in test environment
  if (process.env.NODE_ENV !== 'test') {
    startServer();
  }
