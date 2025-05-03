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
  
      res.json({ result: response.choices[0].message.content });
    } catch (err) {
      console.error(err);
      res.status(500).send("Failed to classify image.");
    }
  });

app.listen(3001, () => {
  console.log('Proxy server running on http://localhost:3001');
});

app.get('/', (req, res) => {
    res.json("Hello world");
})