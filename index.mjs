import express from 'express';
import sharp from 'sharp';
import { fsync, readFileSync } from 'fs';
import { log } from 'console';
import os from 'os'
import fs from "fs"
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';


const app=express();
const port=3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const upload=multer({dest:'uploads/'});
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

app.post('/upload',upload.single('image'),  async (req, res) => {
   try {
  
    const file  = req.file.path;
   
    log(file);
    const width = parseInt(req.body.width);
    const quality = parseInt(req.body.quality) || 80; // Set default quality to 80

    const height = parseInt(req.body.height);
    let format = req.body.format;
   // Read the file from the file system
   const imageBuffer = fs.readFileSync(file);

    // If format is not provided, detect it based on the file extension
    if (!format) {
      const fileExtension = file.split('.').pop().toLowerCase();
      format = fileExtension === 'jpg' ? 'jpeg' : fileExtension;
    }
    if (!height || !width) {
      throw new Error(`Please provide ${!height ? 'height' : 'width'}`);
    }
    console.log(imageBuffer);
  
    const image = await sharp(imageBuffer)
    .resize(width, height,{

      fit: sharp.fit.inside,
      withoutEnlargement: true
    },
 
    
      )
     .toFormat(format,{ quality })
      .toFile();
      const outputImagePath = 'resized/' + image // Destination path for resized image

  
    const originalSize=readFileSync(file).byteLength

 const fileSizeBytes=image.byteLength;
   const fileSizeInKB=fileSizeBytes / 1024;
   const fileSizeInMB=fileSizeInKB / 1024;
    const { width: renderedWidth, height: renderedHeight } = await sharp(image).metadata();
    console.log(`Rendered  Original image size: ${originalSize / 1024} KB  ${(originalSize / 1024) / 1024}MB`);
  
    console.log(`Rendered final image size: ${fileSizeInKB} KB (${fileSizeInMB} MB)`);
  // res.set('Content-Type', `image/${format}`);
    // Pass any relevant information to the rendered view
    res.render('success', { imageUrl:outputImagePath,
      message1:` Original image size was : ${originalSize / 1024} KB  ${(originalSize / 1024) / 1024}MB`,
      message2:`Rendered final image size as: ${fileSizeInKB} KB (${fileSizeInMB} MB)`,
  });
    
    
   } catch (error) {
    console.error(` an error occured ${error}`);
    res.status(404).send(error.message);
    
   }
  });





















