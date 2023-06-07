const express= require ('express')
const sharp = require('sharp');


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
    const width = parseInt(req.query.width);
    const height = parseInt(req.query.height);
    let format = req.query.format;
  
    // If format is not provided, detect it based on the file extension
    if (!format) {
      const fileExtension = file.split('.').pop().toLowerCase();
      format = fileExtension === 'jpg' ? 'jpeg' : fileExtension;
    }
  
    const image = await sharp(file)
      .resize(width, height)
      .toFormat(format)
      .toBuffer();
  
    res.set('Content-Type', `image/${format}`);
    res.send(image);
    
   } catch (error) {
    console.error(` an error occured ${error}`);
    res.status(500).send('Error compressing image.');
    
   }
  });





















