import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import Replicate from 'replicate';
import { send } from 'vite';
import dotenv from 'dotenv';
// import { uploadVideoFirestore } from './firebase/firestore.js';
// import { viewDepthKey } from 'vue-router';
dotenv.config();

import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { fileURLToPath } from 'url';

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
const VISION_TOKEN = process.env.VISION_API_KEY

app.post('/api/style-transfer', async (req, res) => {
    //const testImage = "https://replicate.delivery/pbxt/KYU95NKY092KYhmCDbLLOVHZqzSC27D5kQLHDb28YM6u8Il1/input.jpg";

    const replicate = new Replicate({ auth: API_TOKEN });

    const { image, style_image, style_prompt } = req.body;

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
                width: 720,
                height: 720,
                prompt: style_prompt,
                style_image: style_image,
                output_format:"png",
                output_quality: 80,
                negative_prompt: "",
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

// app.post('/classify-image', async (req, res) => {
//     const { image } = req.body;
//     console.log("Received image:", image?.slice(0, 100)); // Don't flood console

//     // Step 1: Call Google Vision API for face annotations
//     const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${VISION_TOKEN}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//             requests: [{
//                 image: { content: image },
//                 features: [
//                     { type: "LABEL_DETECTION", maxResults: 10 },
//                     { type: "FACE_DETECTION" }
//                 ]
//             }]
//         })
//     });

//     const data = await response.json();
//     console.dir(data, { depth: null }); // Shows entire response clearly

//     if (data.responses?.[0]?.error) {
//         console.error("❌ Vision API Error:", data.responses[0].error);
//     }

//     // Step 2: Gender Classification
//     let gender = "unknown";
//     if (data.responses?.[0]?.faceAnnotations?.length > 0) {
//         // You can infer gender based on a combination of factors:
//         // If Google Vision detects facial features like "lips", "eyebrows", "jaw", you could infer gender.
//         // You could also try using a separate AI model trained for gender detection.

//         // Placeholder gender logic: You'd want to replace this with an actual model or logic
//         gender = "woman"; // Assume woman for simplicity. (You'd replace with AI model/logic)
//     }

//     // Step 3: Hijab Detection (Custom Model or Heuristic)
//     let hijab = false;
//     if (gender === "woman") {
//         // Here you'd implement hijab detection logic, like a simple heuristic or use a custom model
//         // For now, you can check the label detection for "scarf", "headscarf", etc.
//         const labels = data.responses[0].labelAnnotations || [];
//         labels.forEach(label => {
//             if (label.description.toLowerCase().includes("scarf") || label.description.toLowerCase().includes("headscarf")) {
//                 hijab = true;
//             }
//         });
//     }

//     // Send the result back to the frontend
//     res.json({ gender, hijab, data });
// });

  

app.listen(3001, () => {
  console.log('Proxy server running on http://localhost:3001');
});

app.get('/', (req, res) => {
    res.json("Hello world");
})