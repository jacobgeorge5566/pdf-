const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const fs = require("fs").promises;
const fd = require("fs")
const { pdf } = require("pdf-to-img");
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });


// pdfParse.PDFJS.disableWorker = true;



const genAI = new GoogleGenerativeAI(process.env.API_KEY);

function fileToGenerativePart(path, mimeType) {
    return {
      inlineData: {
        data: Buffer.from(fd.readFileSync(path)).toString("base64"),
        mimeType
      },
    };
}




const app = express();

let port=4000
app.listen(port, () => console.log(`Server listening on port ${port}`));

const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
let  prompt = "summarize this \n";

app.post("/summarize", upload.single('image'), async (req, res) => {
 
    let counter = 1;
    const document = await pdf(req.file.path, { scale: 3 });
    let summary="";
  
    for await (const image of document) {
      const imagePath = `page${counter}.png`;
      await fs.writeFile(imagePath, image);
      const imageParts=[fileToGenerativePart(imagePath, "image/png")];
      console.log(imageParts);
      const result = await model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      const text = response.text();
      summary+=text;
      counter++;
    }
    res.send(summary);
  
  
  
});

app.post("/summarize/text", upload.single('image'), async (req, res) => {

    
});