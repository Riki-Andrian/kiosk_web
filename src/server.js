import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import Replicate from 'replicate';
import { send } from 'vite';
import dotenv from 'dotenv';
import { AzureOpenAI } from "openai";
// import { uploadVideoFirestore } from './firebase/firestore.js';
// import { viewDepthKey } from 'vue-router';
dotenv.config();

import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import sharp from 'sharp';
import createClient from "@azure-rest/ai-vision-face";
import { AzureKeyCredential } from "@azure/core-auth";
import { readFile } from 'fs/promises';

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
app.use("/output", express.static(path.join(__dirname, "output")));
const upload = multer({ dest: "uploads/" });

const API_TOKEN = process.env.REPLICATE_API_TOKEN;

  const faceClient = createClient(
    process.env.FACE_API_ENDPOINT,
    new AzureKeyCredential(process.env.FACE_API_KEY)
  );

app.post('/api/style-transfer', async (req, res) => {
  //const testImage = "https://replicate.delivery/pbxt/KYU95NKY092KYhmCDbLLOVHZqzSC27D5kQLHDb28YM6u8Il1/input.jpg";

  const replicate = new Replicate({ auth: API_TOKEN });

  const { image, style_image, style_prompt, negative_prompt } = req.body;

  console.log('ini style image nya:', style_image);

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
        threshold: 0.99,
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
        output_format: "png",
        output_quality: 80,
        negative_prompt: negative_prompt,
        structure_image: removedBackgroundUrl,
        number_of_images: 1,
        structure_depth_strength: 2,
        structure_denoising_strength: 0.7
      }
    });

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

    const { top, left, width, height } = faceRectangle;

    // Buat instance sharp untuk akses metadata
    const sharpImage = sharp(imageBuffer);
    const metadata = await sharpImage.metadata();

    const padding = 150;
    const imgWidth = metadata.width;
    const imgHeight = metadata.height;

    // Hitung area crop yang diperbesar, tapi tetap dalam batas gambar
    const paddedTop = Math.max(0, top - padding);
    const paddedLeft = Math.max(0, left - padding);
    const paddedWidth = Math.min(width + padding * 2, imgWidth - paddedLeft);
    const paddedHeight = Math.min(height + padding * 2, imgHeight - paddedTop);

    // Crop wajah dengan padding
    const croppedFace = await sharpImage
      .extract({
        top: paddedTop,
        left: paddedLeft,
        width: paddedWidth,
        height: paddedHeight,
      })
      .toFormat('png')
      .toBuffer();

    // Simpan untuk debug
    //fs.writeFileSync('./cropped-face-debug.png', croppedFace);

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
      hijab: hijabResult.predictions,
    });

  } catch (err) {
    res.status(500).json({ error: 'Failed to detect hijab' });
  }
});

const swapFace = async (srcImg, targetImg) => {
  console.log("urls: " + srcImg + " " + targetImg);

  const base64srcImg = await imageFileToBase64(srcImg);
  const base64targetImg = await imageFileToBase64(targetImg);

  const data = {
    "source_img":base64srcImg,
    "target_img": base64targetImg,
    "input_faces_index": 0,
    "source_faces_index": 0,
    "face_restore": "codeformer-v0.1.0.pth",
    "base64": false
  };

  try {
    const response = await fetch("https://api.segmind.com/v1/faceswap-v2", {
      method: 'POST',
      headers: {
        'x-api-key': process.env.SEGMIND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log(responseData);
    return responseData;
  } catch (error) {
    console.error('Error:', error.message);
  }
}

const imageFileToBase64 = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer).toString('base64');
  } catch (error) {
    throw new Error(`Error fetching image URL: ${error.message}`);
  }
});

app.post("/api/process-video", async (req, res) => {
  const { imageCoord } = req.body;
  const outputPath = path.join(__dirname, "output/output.mp4");

  const inputVideo = path.join(__dirname, "assets/video/ENTP-ENFP.mp4");
  const music = path.join(__dirname, "assets/music/ENTP_ENFP/1.mp3");
  const img = path.join(__dirname, "assets/Idle.png");

  const imageOverlayFilter = `[1:v]format=yuva420p,scale=495:495,fade=t=in:st=0:d=1:alpha=1[ovl];[0:v][ovl]overlay=${imageCoord}`;

  try {
        ffmpeg()
      .input(inputVideo) // 0:v
      .input(img)        // 1:v (image)
      .inputOptions([    // ini untuk gambar
        "-loop 1"
      ])
      .input(music)      // 2:a
      .inputOptions([
        "-t 10" // durasi overlay-nya
      ])
      .complexFilter([
        {
          filter: "format",
          options: "yuva420p",
          inputs: "[1:v]",
          outputs: "fmt"
        },
        {
          filter: "scale",
          options: "495:495",
          inputs: "fmt",
          outputs: "scl"
        },
        {
          filter: "fade",
          options: "t=in:st=0:d=1:alpha=1",
          inputs: "scl",
          outputs: "ovl"
        },
        {
          filter: "overlay",
          options: imageCoord,
          inputs: ["0:v", "ovl"],
          outputs: "final"
        }
      ])
      .outputOptions([
        "-map [final]",
        "-map 2:a",
        "-c:v libx264",
        "-preset veryfast",
        "-crf 23",
        "-threads 4",
        "-b:v 700k",
        "-c:a aac",
        "-shortest"
      ])
      .save(outputPath)
      .on("end", () => {
        const videoUrl = `/output/output.mp4`;
        return res.json({ success: true, url: videoUrl });
      })
      .on("error", (err) => {
        console.error("FFmpeg error:", err.message);
        if (!res.headersSent) {
          return res.status(500).send("Video processing failed.");
        }
      });
  } catch (err) {
    console.error("Server error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Server processing error" });
    }
  }
});


app.listen(3001, () => {
  console.log('Proxy server running on http://localhost:3001');
});

app.get('/', (req, res) => {
  res.json("Hello world");
})