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
    const replicate = new Replicate({ auth: API_TOKEN });

    const input = {
        style_image: req.body.image,
        prompt: req.body.textContent
    };

    const output = await replicate.run("fofr/style-transfer:f1023890703bc0a5a3a2c21b5e498833be5f6ef6e70e9daf6b9b3a4fd8309cf0", { input });

    res.json({ success: true, images: output[0].url() });
});

app.listen(3001, () => {
  console.log('Proxy server running on http://localhost:3001');
});

app.get('/', (req, res) => {
    res.json("Hello world");
})