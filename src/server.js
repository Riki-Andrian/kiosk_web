import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import Replicate from 'replicate';
import { send } from 'vite';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

// Increase the size limit for JSON requests
app.use(express.json({ limit: '50mb' }));

app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(cors());
app.use(express.json());

const API_TOKEN = process.env.REPLICATE_API_TOKEN;

app.post('/api/style-transfer', async (req, res) => {
    console.log(req.body);
    const replicate = new Replicate({ auth: API_TOKEN });

    // const input = {
    //     image: req.body.image,
    //     prompt: req.body.textContent,
    //     style_image: req.body.style_image
    // };

    const { image, style_image } = req.body;

    if (!image || !style_image) {
        return res.status(400).json({ success: false, error: "Missing image or style_image" });
      }

    const output = await replicate.run(
        "fofr/style-transfer:f1023890703bc0a5a3a2c21b5e498833be5f6ef6e70e9daf6b9b3a4fd8309cf0", 
        { 
            input: {
                model: "fast",
                width: 720,
                height: 720,
                prompt: "do not change the hairstyle",
                style_image: style_image,
                output_format:"png",
                output_quality: 80,
                negative_prompt: "",
                structure_image: image,
                number_of_images: 1,
                structure_depth_strength: 2,
                structure_denoising_strength: 0.7
        }});

    res.json({ success: true, images: output[0].url() });
});

app.listen(3001, () => {
  console.log('Proxy server running on http://localhost:3001');
});

app.get('/', (req, res) => {
    res.json("Hello world");
})