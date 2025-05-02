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

app.post('/api/style-transfer', async (req, res) => {
    //const testImage = "https://replicate.delivery/pbxt/KYU95NKY092KYhmCDbLLOVHZqzSC27D5kQLHDb28YM6u8Il1/input.jpg";

    const replicate = new Replicate({ auth: API_TOKEN });

    const { image, style_image, style_prompt, gender } = req.body;

    console.log('ini style image nya:',style_image);

    if (!image || !style_image) {
        return res.status(400).json({ success: false, error: "Missing image or style_image" });
    }

    let selectedStylePrompt = '';

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

    const hijabCheck = {
        method: "POST",
        url: "https://serverless.roboflow.com/hijab-nirfi/1",
        params: {
            api_key: process.env.ROBOFLOW_API_KEY,
            image: removedBackgroundUrl
        }
    };

    const data = await hijabCheck.json();
    let isHijab = "";
    if (data.predictions[0].class_id !== null && (data.predictions[0].class_id === 0 || data.predictions[0].class_id === 1)) {
        isHijab = " wearing hijab";
    }

    switch (style_prompt) {
        case 1:
            selectedStylePrompt = `a ${gender}${isHijab} with a comic book-style sky with a bright, vivid blue background and scattered white cumulus clouds outlined in black. The scene should include halftone dot patterns, sketch-style brush strokes, and a retro pop art aesthetic. The clouds should have soft, rounded shapes with subtle blue shading and be spread across a dynamic diagonal composition.`;
            break;
        case 2:
            selectedStylePrompt = `a ${gender}${isHijab} with a bold comic book-style sunburst with a bright yellow circular center and sharp yellow rays extending outward. The background should be a vivid teal color with halftone dot patterns and radiating black lines, evoking a vintage pop art or retro comic book vibe. The composition should be symmetrical and eye-catching, with high contrast and clean outlines. keep maintain the face, hair, and head look same with the source of structure image. if the structure image use hijab, then put the hijab.`;
            break;
        case 3:
            selectedStylePrompt = `A ${gender}${isHijab} with a dynamic comic book-style explosion in the gradient caramel with bright orange and yellow bubble, surrounded by dramatic black speed lines. Use a halftone dot pattern in the background with a caramel. The art style should be bold, vibrant, and high-energy, evoking retro pop art and vintage comic aesthetics.`;
            break;
        case 4:
            selectedStylePrompt = `A ${gender}${isHijab} with a vibrant, stylized subway station rendered in a pop-art or comic book aesthetic, with bold green and yellow tones. Two trains are parked on either side of the empty platform, which stretches into a vanishing point in the distance. The ceiling is composed of glowing geometric panels, casting dynamic reflections on the polished floor. The entire scene has a retro-futuristic feel, with heavy linework and halftone textures enhancing the dramatic lighting.`;
            break;
        case 5:
            selectedStylePrompt = `A ${gender}${isHijab} with a futuristic cyberpunk cityscape under a dramatic red sky, with towering dark skyscrapers illuminated by vivid red window lights. The scene is intense and moody, with a graphic comic book anime style featuring bold shadows and a halftone texture. The streets are empty, reflecting streaks of red light, evoking a sense of mystery and dystopia. Keep the face same as reference`;
            break;
    }

    const output = await replicate.run(
        "fofr/style-transfer:f1023890703bc0a5a3a2c21b5e498833be5f6ef6e70e9daf6b9b3a4fd8309cf0", 
        { 
            input: {
                model: "fast",
                width: 720,
                height: 720,
                prompt: selectedStylePrompt,
                style_image: style_image,
                output_format:"png",
                output_quality: 80,
                negative_prompt: "",
                structure_image: removedBackgroundUrl,
                number_of_images: 1,
                structure_depth_strength: 2,
                structure_denoising_strength: 0.7
            }
        }
    );

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

app.listen(3001, () => {
  console.log('Proxy server running on http://localhost:3001');
});

app.get('/', (req, res) => {
    res.json("Hello world");
})