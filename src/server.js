import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import Replicate from 'replicate';
import { send } from 'vite';
import dotenv from 'dotenv';
import { AzureOpenAI} from "openai";
// import { uploadVideoFirestore } from './firebase/firestore.js';
// import { viewDepthKey } from 'vue-router';
dotenv.config();

import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import createClient from "@azure-rest/ai-vision-face";
import { AzureKeyCredential } from "@azure/core-auth";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Increase the size limit for JSON requests
app.use(express.json({ limit: '50mb' }));

app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/assets', express.static(path.join(__dirname, 'src', 'assets')));

const API_TOKEN = process.env.REPLICATE_API_TOKEN;

app.post('/api/style-transfer', async (req, res) => {
    //const testImage = "https://replicate.delivery/pbxt/KYU95NKY092KYhmCDbLLOVHZqzSC27D5kQLHDb28YM6u8Il1/input.jpg";

    const replicate = new Replicate({ auth: API_TOKEN });

    const { image, style_image, style_prompt, negative_prompt } = req.body;

    console.log('ini style image nya:',style_image);

    if (!image || !style_image) {
        return res.status(400).json({ success: false, error: "Missing image or style_image" });
    }

    const removeBackground = await replicate.run(
        "851-labs/background-remover:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc",
        {
          input: {
            image: image,
            format: "png",
            reverse: false,
            threshold: 0.9,
            background_type: 'blur'
          }
        }
    );

    const removedBackgroundUrl = removeBackground.url();

    const output = await replicate.run(
        "fofr/style-transfer:f1023890703bc0a5a3a2c21b5e498833be5f6ef6e70e9daf6b9b3a4fd8309cf0", 
        { 
            input: {
                model: "fast",
                width: 512,
                height: 512,
                prompt: style_prompt,
                style_image: style_image,
                output_format:"png",
                output_quality: 80,
                negative_prompt: negative_prompt,
                structure_image: removedBackgroundUrl,
                number_of_images: 1,
                structure_depth_strength: 2,
                structure_denoising_strength: 0.7
        }});

    const editedImage = output[0].url();
    console.log(editedImage);

    const swapFace = await replicate.run(
        "cdingram/face-swap:d1d6ea8c8be89d664a07a457526f7128109dee7030fdac424788d762c71ed111",
        {
            input: {
            swap_image: removedBackgroundUrl,
            input_image: editedImage
            }
        }
    );

    console.log(swapFace);

    res.json({ success: true, images: swapFace.url() });
});

const endpoint = "https://ai-dexel7zip4033ai669694789256.openai.azure.com/";
const deployment = "gpt-4o-mini";
const apiKey = process.env.AZURE_API_KEY;
const apiVersion = "2024-04-01-preview";

const client = new AzureOpenAI({ endpoint, apiKey, deployment, apiVersion });

app.post('/api/classify', async (req, res) => {
    const { base64Image, prompt } = req.body;
  
    try {
      const response = await client.chat.completions.create({
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt || "Describe this image." },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        model: deployment,
        max_tokens: 1000
      });
  
      const usage = response.usage || {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0
      };
  
      console.log("Token Usage:", usage);
  
      res.json({
        result: response.choices[0].message.content,
        usage // Include token usage in API response
      });
    } catch (err) {
      console.error("Classification error:", err);
      res.status(500).send("Failed to classify image.");
    }
  }); 
 //------------------------------------------------------------------------------------------------------
  const faceClient = createClient(
    process.env.FACE_API_ENDPOINT,
    new AzureKeyCredential(process.env.FACE_API_KEY)
  );

  app.post('/api/gender-hijab', async (req, res) => {
  const { base64Image } = req.body;
  if (!base64Image) return res.status(400).json({ error: 'No image provided' });

  try {
    const imageBuffer = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    
    // Call Face API using SDK
    const detectResponse = await faceClient.path("/detect").post({
      contentType: "application/octet-stream",
      queryParameters: {
        detectionModel: "detection_03",
        returnFaceId: false, // tidak perlu returnFaceAttributes
      },
      body: imageBuffer,
    });
    

    if (detectResponse.status !== "200") {
      console.error("Face API error:", detectResponse.body);
      return res.status(500).json({ error: "Face API failed." });
    }

    const faces = detectResponse.body;

    if (!Array.isArray(faces) || faces.length === 0) {
      return res.json({ message: 'No face detected' });
    }

    // Sort faces to find the largest one
    const sorted = faces.sort((a, b) => {
      const aSize = a.faceRectangle.width * a.faceRectangle.height;
      const bSize = b.faceRectangle.width * b.faceRectangle.height;
      return bSize - aSize;
    });

    const mainFace = sorted[0];
    const { faceRectangle } = mainFace;

    // Crop face using sharp
    const { top, left, width, height } = faceRectangle;
    const croppedFace = await sharp(imageBuffer)
      .extract({ top, left, width, height })
      .toFormat('png')
      .toBuffer();

    const genderCheck = await fetch(
      'https://hijabdetection-prediction.cognitiveservices.azure.com/customvision/v3.0/Prediction/6206146d-0b29-44ff-be74-ef563b7ab497/classify/iterations/gender-detection-v1/image',
      {
        method: 'POST',
        headers: {
          'Prediction-Key': process.env.HIJAB_PREDICTION_KEY,
          'Content-Type': 'application/octet-stream',
        },
        body: croppedFace,
      }
    );

    const genderCheckResult = await genderCheck.json();

    const topPrediction = genderCheckResult.predictions.reduce((max, current) =>
      current.probability > max.probability ? current : max
    );

    if(topPrediction.tagName === "man"){
      res.json({gender: topPrediction.tagName, hijab: null, message: "Woman not detected, skipping hijab check."})
    }

    // Call hijab classifier (tetap pakai fetch karena ini Custom Vision)
    const hijabResponse = await fetch(
      'https://hijabdetection-prediction.cognitiveservices.azure.com/customvision/v3.0/Prediction/a1b18e9d-0cbb-41b3-b1aa-809906172159/classify/iterations/hijab-detection-v2/image',
      {
        method: 'POST',
        headers: {
          'Prediction-Key': process.env.HIJAB_PREDICTION_KEY,
          'Content-Type': 'application/octet-stream',
        },
        body: croppedFace,
      }
    );

    const hijabResult = await hijabResponse.json();

    console.log(hijabResult.predictions);

    res.json({
      gender: topPrediction.tagName,
      hijab: hijabResult.predictions,
    });

  } catch (err) {
    console.error('Gender + Hijab detection error:', err);
    res.status(500).json({ error: 'Failed to detect gender/hijab' });
  }
});
  
app.listen(3001, () => {
  console.log('Proxy server running on http://localhost:3001');
});

app.get('/', (req, res) => {
    res.json("Hello world");
})