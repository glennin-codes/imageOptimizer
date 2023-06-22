import express from 'express';
import sharp from 'sharp';
import { fsync, readFileSync } from 'fs';
import { log } from 'console';
import { v4 as uuidv4 } from 'uuid';
import os from 'os'
import fs from "fs"
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import path from 'path'

const app=express();
const port=3000;
app.use(express.static('public'));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: function (req, file, cb) {
    const fileExtension = file.originalname.split('.').pop().toLowerCase();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    cb(null, uniqueFileName);
  }
});

const upload = multer({ storage: storage });

app.set('view engine', 'ejs');
app.set('views', `${__dirname}/views`); 
app.get('/',(req,res)=>{
  const message=`server working properly ${os.hostname()}`
  const formats = ['jpeg', 'jpg','png', 'webp', 'avif', 'gif', 'svg', 'tiff'];
  res.render(
        'form',{message:{
          message,
          formats

        }}
    )
log(message);
});

app.listen(port,()=>{
    console.log(`server is listening on http://localhost:${port}`);
})


app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const file = req.file.path;
    const files = req.file;
const originalFilename = files.originalname;
log("original",originalFilename);

const fileExtension = originalFilename.split('.').pop().toLowerCase();
console.log('File format:', fileExtension);

    const width = parseInt(req.body.width);
    const quality = parseInt(req.body.quality) || 80;
    const height = parseInt(req.body.height);
    let format = req.body.format;
    log("file",file)

    if (!format) {
      const fileExtension = path.extname(file).toLowerCase().substring(1);
      format = fileExtension === 'jpg' ? 'jpeg' : fileExtension;
    }
    if(format==='tiff'){
      throw new Error ('format tiff is not supported currently for processing')
    }
    if (!height || !width) {
      throw new Error(`Please provide ${!height ? 'height' : 'width'}`);
    }

    const uniqueSuffix = Date.now(); // Generate a unique timestamp as the suffix
    const outputImagePath = path.join(__dirname, 'public', `output_${uniqueSuffix}.${format}`);
    
    await sharp(file)
      .resize(width, height, {
        fit: sharp.fit.inside,
        withoutEnlargement: true
      })
      .toFormat(format, { quality })
      .toFile(outputImagePath);

    const originalSize = fs.statSync(file).size;
    const resizedSize = fs.statSync(outputImagePath).size;

    const fileSizeInKB = resizedSize / 1024;
    const fileSizeInMB = fileSizeInKB / 1024;

    const { width: renderedWidth, height: renderedHeight } = await sharp(outputImagePath).metadata();

    res.render('success', {
      imageUrl: `output_${uniqueSuffix}.${format}`,
      message1: `Original image size: ${originalSize / 1024} KB (${(originalSize / 1024) / 1024} MB)`,
      message2: `Rendered final image size: ${fileSizeInKB} KB (${fileSizeInMB} MB)`,
    });
    log('path',outputImagePath)
  } catch (error) {
    console.error(`An error occurred: ${error}`);
    
      if(error.message && error.message==='Expected one of: heic, heif, avif, jpeg, jpg, jpe, tile, dz, png, raw, tiff, tif, webp, gif, jp2, jpx, j2k, j2c, jxl for format but received svg of type string'){
        res.status(404).render('error',{message:"svg not supported currently "})
        
      }else{
        res.status(404).render("error",{
          message:error.message
        })
      }

 
  }
});





















