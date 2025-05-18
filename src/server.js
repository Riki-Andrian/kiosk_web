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
  const replicate = new Replicate({ auth: API_TOKEN });

  const { image, style_image, style_prompt, negative_prompt } = req.body;
  function cleanBase64(base64String) {
  return base64String.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
}

  const imagePureBase64 = cleanBase64(image);

  if (!image || !style_image) {
    return res.status(400).json({ success: false, error: "Missing image or style_image" });
  }

  // const removeBackground = await replicate.run(
  //   "851-labs/background-remover:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc",
  //   {
  //     input: {
  //       image: image,
  //       format: "png",
  //       reverse: false,
  //       threshold: 0.99,
  //       background_type: 'blur'
  //     }
  //   }
  // );

  // const removedBackgroundUrl = removeBackground.url();

   // const output = await replicate.run(
  //   "fofr/style-transfer:f1023890703bc0a5a3a2c21b5e498833be5f6ef6e70e9daf6b9b3a4fd8309cf0",
  //   {
  //     input: {
  //       model: "fast",
  //       width: 512,
  //       height: 512,
  //       prompt: style_prompt,
  //       style_image: style_image,
  //       output_format: "png",
  //       output_quality: 80,
  //       negative_prompt: negative_prompt,
  //       structure_image: removedBackgroundUrl,
  //       number_of_images: 1,
  //       structure_depth_strength: 2,
  //       structure_denoising_strength: 0.7
  //     }
  //   });

  // const editedImage = output[0].url();
  // console.log(editedImage);

  const transferFile = async (srcImg, targetImg) => {
    const formData = new FormData();
    formData.append('seed', 132);
    formData.append('model', 'fast');
    formData.append('width', 240);
    formData.append('height', 240);
    formData.append('prompt', style_prompt);
    formData.append('style_image', targetImg);
    formData.append('output_format', 'png');
    formData.append('output_quality', 50);
    formData.append('negative_prompt', negative_prompt);
    formData.append('structure_image', srcImg);
    formData.append('number_of_images', 1);
    formData.append('structure_depth_strength', 1);
    formData.append('structure_denoising_strength', 0.65);

    try {
      const response = await fetch('https://api.segmind.com/v1/style-transfer', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.SEGMIND_API_KEY,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const buffer = await response.buffer();
      const base64Image = buffer.toString('base64');
      const cleanBase64Image = cleanBase64(base64Image);

      return cleanBase64Image; // Pure base64 without any prefix
    } catch (error) {
      console.error('Error:', error.message);
      throw error;
    }
  };

  const transferFile2 = async (srcImg, targetImg) => {
    const data = {
      "source_img": srcImg,
      "target_img": targetImg,
      "image_format": "webp"
    };

    try {
      const response2 = await fetch('https://api.segmind.com/v1/faceswap-v3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.SEGMIND_API_KEY,
        },
        body: JSON.stringify(data),
      });

      if (!response2.ok) {
        const errorText = await response2.text();
        throw new Error(errorText);
      }

      const buffer2 = await response2.arrayBuffer();
      const base64Image2 = Buffer.from(buffer2).toString('base64');

      return base64Image2;
    } catch (error) {
      console.error('Error:', error.message);
      throw error;
    }
  };

  try {
    const faceswapResult = await transferFile(image, style_image);
    const finalResult = await transferFile2(imagePureBase64, faceswapResult);

    res.json({ success: true, images: finalResult });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
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

const imageFileToBase64 = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer).toString('base64');
  } catch (error) {
    throw new Error(`Error fetching image URL: ${error.message}`);
  }
};

app.post("/api/process-video", async (req, res) => {
  const { imageCoord, overlayImageUrl, personalityStyle } = req.body;
  const buffer = Buffer.from(overlayImageUrl, 'base64');
  let imagePath;

  file({ postfix: '.png' }, (err, imagePath, fd, cleanupCallback) => {
    if (err) throw err;

    writeFile(imagePath, buffer, (err) => {
      if (err) throw err;

      const selectedNumber = Math.floor(Math.random() * 9) + 1;

      const inputVideo = path.join(__dirname, `assets/video/${personalityStyle}.mp4`);
      const music = path.join(__dirname, `assets/music/${personalityStyle}/${selectedNumber}.mp3`);

      res.setHeader("Content-Type", "video/mp4");
      res.setHeader("Content-Disposition", "inline; filename=output.mp4");

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
          { filter: "overlay", options: imageCoord, inputs: ["0:v", "ovl"], outputs: "final" }
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
          "-shortest",
          "-movflags frag_keyframe+empty_moov" // critical for MP4 streaming
        ])
        .format('mp4')
        .on("error", (err) => {
          //console.error("FFmpeg error:", err.message);
          if (!res.headersSent) {
            res.status(500).send("Video processing failed.");
          }
        })
        .pipe(res, { end: true });
    });
  });
});

app.listen(3001, () => {
  console.log('Proxy server running on http://localhost:3001');
});

app.get('/', (req, res) => {
  res.json("Hello world");
})