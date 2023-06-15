const express= require ('express')
const sharp = require('sharp');
const fs=require ('fs');
const { log } = require('console');


const app=express();
const port=3000;
app.get('/',(req,res)=>{
    res.send("server working properly");

});
app.listen(port,()=>{
    console.log(`server is listening on http://localhost:${port}`);
})

app.get('/resize', async (req, res) => {
   try {
  
    const { file } = req.query;
    const filePath = file.split('?')[0];

    const width = parseInt(req.query.width);
    const quality = parseInt(req.query.quality) || 80; // Set default quality to 80

    const height = parseInt(req.query.height);
    let format = req.query.format;
  
    // If format is not provided, detect it based on the file extension
    if (!format) {
      const fileExtension = file.split('.').pop().toLowerCase();
      format = fileExtension === 'jpg' ? 'jpeg' : fileExtension;
    }
  
    const image = await sharp(filePath)
    .resize(width, height,
            {
              crop:"inside"
            }
      )
     .toFormat(format)
      .toBuffer();
     
    res.set('Content-Type', `image/${format}`);
    res.send(image);
    const originalSize=fs.readFileSync(filePath).byteLength

 const fileSizeBytes=image.byteLength;
   const fileSizeInKB=fileSizeBytes / 1024;
   const fileSizeInMB=fileSizeInKB / 1024;
    const { width: renderedWidth, height: renderedHeight } = await sharp(image).metadata();
    console.log(`Rendered  Original image size: ${originalSize / 1024} KB  ${(originalSize / 1024) / 1024}MB`);
  
    console.log(`Rendered final image size: ${fileSizeInKB} KB (${fileSizeInMB} MB)`);

    
    
   } catch (error) {
    console.error(` an error occured ${error}`);
    
    
   }
  });





















