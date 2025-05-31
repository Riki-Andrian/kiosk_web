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

import fs, { writeFile } from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import sharp from 'sharp';
import createClient from "@azure-rest/ai-vision-face";
import { AzureKeyCredential } from "@azure/core-auth";
import { readFile } from 'fs/promises';
import { file } from 'tmp';
import { randomUUID } from 'crypto';
import { blob } from 'stream/consumers';

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

  const { image, style_image, style_prompt, negative_prompt, seed } = req.body;

  console.log('ini style image nya:', style_image);

  if (!image || !style_image) {
    return res.status(400).json({ success: false, error: "Missing image or style_image" });
  }

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
        structure_image: image,
        number_of_images: 1,
        structure_depth_strength: 2,
        structure_denoising_strength: 1,
        seed: seed,
      }
    });

  const editedImage = output[0].url();
  console.log(editedImage);

  const swapFace = await replicate.run(
    "cdingram/face-swap:d1d6ea8c8be89d664a07a457526f7128109dee7030fdac424788d762c71ed111",
    {
      input: {
        swap_image: image,
        input_image: editedImage
      }
    }
  );

  console.log(swapFace);

  res.json({ success: true, images: swapFace.url() });
});

app.post('/api/detect-accessories-hair', async (req, res) => {
  const { base64Image } = req.body;
  if (!base64Image) return res.status(400).json({ error: 'No image provided' });

  try {
    const imageBuffer = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ''), 'base64');

    // Step 1: Detect faces using Azure Face API
    const detectResponse = await faceClient.path("/detect").post({
      contentType: "application/octet-stream",
      queryParameters: {
        detectionModel: "detection_03",
        returnFaceId: false,
        returnFaceAttributes: "glasses"
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

    // Step 2: Sort to find the closest/largest face
    const sorted = faces.sort((a, b) => {
      const aSize = a.faceRectangle.width * a.faceRectangle.height;
      const bSize = b.faceRectangle.width * b.faceRectangle.height;
      return bSize - aSize;
    });

    const mainFace = sorted[0];
    const { faceRectangle, hair, accessories } = mainFace;

    const glasses = mainFace.faceAttributes.glasses;

    // Step 3: Use sharp to crop this face (optional for debugging/saving)
    const sharpImage = sharp(imageBuffer);
    const metadata = await sharpImage.metadata();

    const padding = 150;
    const { top, left, width, height } = faceRectangle;
    const paddedTop = Math.max(0, top - padding);
    const paddedLeft = Math.max(0, left - padding);
    const paddedWidth = Math.min(width + padding * 2, metadata.width - paddedLeft);
    const paddedHeight = Math.min(height + padding * 2, metadata.height - paddedTop);

    const croppedFaceBuffer = await sharpImage
      .extract({
        top: paddedTop,
        left: paddedLeft,
        width: paddedWidth,
        height: paddedHeight,
      })
      .toFormat('png')
      .toBuffer();

    // Optional: Convert to base64 if you want to return it
    const croppedFaceBase64 = `data:image/png;base64,${croppedFaceBuffer.toString('base64')}`;

    // Step 4: Analyze attributes
    const baldScore = hair?.bald || 0;
    const hairType = baldScore > 0.8 ? 'bald' : '';

    const headwearDetected = (accessories || []).some(acc =>
      acc.type === 'headWear' && acc.confidence > 0.7
    );

    const result = {
      glasses
    };

    res.json(result);

  } catch (err) {
    console.error('Detection error:', err);
    res.status(500).json({ error: 'Failed to detect accessories & hair type' });
  }
});


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
        returnFaceId: false,
      },
      body: imageBuffer,
    });


    if (detectResponse.status !== "200") {
      //console.error("Face API error:", detectResponse.body);
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

    //console.log(hijabResult.predictions);

    res.json({
      hijab: hijabResult.predictions,
    });

  } catch (err) {
    res.status(500).json({ error: 'Failed to detect hijab' });
  }
});

app.post("/api/process-video", async (req, res) => {
  try {
    const { imageCoord, overlayImageUrl, personalityStyle, username } = req.body;
    
    const response = await fetch(overlayImageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    file({ postfix: '.png' }, (err, imagePath, fd, cleanupCallback) => {
      if(err) {
        console.error("Error creating temporary file:", err);
        if (!res.headersSent) {
          res.status(500).send("Failed to create temporary file");
        }
        return;
      }

      writeFile(imagePath, buffer, (err) => {
        if (err) {
          console.error("Error writing file:", err);
          if (!res.headersSent) {
            res.status(500).send("Failed to write file");
          }
          return;
        }

        const selectedNumber = Math.floor(Math.random() * 9) + 1;

        const inputVideo = path.join(__dirname, `assets/video/${personalityStyle}.mp4`);
        const music = path.join(__dirname, `assets/music/${personalityStyle}/${selectedNumber}.mp3`);

        res.setHeader("Content-Type", "video/mp4");
        res.setHeader("Content-Disposition", "inline; filename=output.mp4");

        const uid = randomUUID();
        const generatedVideosPath = path.join(__dirname, 'generated_videos');
        if (!fs.existsSync(generatedVideosPath)) {
          fs.mkdirSync(generatedVideosPath);
        }
        const filePath = path.join(generatedVideosPath, `${username}-${uid}.mp4`);

        ffmpeg()
          .input(inputVideo)
          .input(imagePath)
          .inputOptions(["-loop 1"])
          .inputOptions(["-t 5"])
          .input(music)
          .complexFilter([
            { filter: "format", options: "yuva420p", inputs: "[1:v]", outputs: "fmt" },
            { filter: "scale", options: "745:745", inputs: "fmt", outputs: "scl" },
            { filter: "fade", options: "t=in:st=0:d=1:alpha=1", inputs: "scl", outputs: "ovl" },
            { filter: "overlay", options: imageCoord, inputs: ["0:v", "ovl"], outputs: "v" }
          ])
          .outputOptions([
            "-map", "[v]",           // Map the overlayed video output
            "-map", "2:a",           // Map audio from third input (music)
            "-c:v", "libx264",
            "-preset", "veryfast",   // Match your original preset
            "-crf", "23",
            "-threads", "4",
            "-b:v", "700k",
            "-c:a", "aac",
            "-shortest"
          ])
          .format('mp4')
          .on("error", (err) => {
            console.error("FFmpeg error:", err.message);
            if (!res.headersSent) {
              res.status(500).send("Video processing failed.");
            }
          })
          .on("end", () => {
            const stat = fs.statSync(filePath);
            res.writeHead(200, {
              "Content-Type": "video/mp4",
              "Content-Length": stat.size
            });
            const readStream = fs.createReadStream(filePath);
            readStream.pipe(res);
          })
          .save(filePath);
      });
    });
  } catch (error) {
    console.error("Error processing video:", error);
    if (!res.headersSent) {
      res.status(500).send("Failed to process video");
    }
  }
});

app.listen(3001, () => {
  console.log('Proxy server running on http://localhost:3001');
});

app.get('/', (req, res) => {
  res.json("Hello world");
});