<script setup>
import { ref, onMounted, computed, watch, nextTick } from "vue";
import { useRouter, useRoute } from 'vue-router';
import PreviewPicture from "./PreviewPicture.vue";
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import lottie from 'lottie-web';
import videoSrc from "@/assets/template.mp4";
import video1 from "@/assets/video1/ENTP-ENFP.mp4";
import video2 from "@/assets/video1/ESFJ-ENFJ.mp4";
import video3 from "@/assets/video1/ESTP-ESFP.mp4";
import video4 from "@/assets/video1/INFJ-INFP.mp4";
import video5 from "@/assets/video1/INTJ-INTP.mp4";
import foto from "@/assets/Idle.png"
import mld_kiosk from "@/assets/mld_kiosk.mp3"
import loadingAnimation from '@/assets/loading.json';
import { uploadVideoFirestore } from "@/firebase/firestore";
import { INTJ_INTP, ENTP_ENFP, ESFJ_ENFJ, ESTP_ESFP, INFJ_INFP } from "@/assets/music/index.js";
import { v4 } from "uuid";

const router = useRouter();
const route = useRoute();

const cameraStream = ref(null);
const capturedImage = ref(null);
const name = ref(localStorage.getItem("name") || null);
const gender = ref(localStorage.getItem("gender") || null);
const personality = ref(route.params.personality);
const editedImage = ref(null);
const imageUrl = computed(() => capturedImage.value);

const ffmpeg = createFFmpeg({ log: true });
const videoFile = ref(null);
let musicFile = ref(null);
const outputUrl = ref(null);
const downloadUrl = ref(null);
const imageCoord = ref(null);
const isLoading = ref(false);
const lottieContainer = ref(null);

const countdown = ref(3);
const isCountingDown = ref(false);
let countdownInterval = null;
let genderPrompt = "";

const loadComponent = async () => {
    console.log(`Name: ${name.value}, Gender: ${gender.value}`);

    if (!name.value || !gender.value) {
        router.push('/');
        return;
    }

    await ffmpeg.load();
    console.log("FFmpeg is ready!");
};

onMounted(loadComponent);


const loadCameraStream = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });

        if (cameraStream.value) {
            cameraStream.value.srcObject = stream;
        }
    } catch (error) {
        console.error("Error accessing camera:", error);
    }
};
onMounted(loadCameraStream);

const capturePhoto = () => {
    if (!cameraStream.value) return;

    countdown.value = 3;
    isCountingDown.value = true;

    countdownInterval = setInterval(() => {
        countdown.value--;

        if (countdown.value === 0) {
            clearInterval(countdownInterval);
            isCountingDown.value = false;

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            // Get dimensions from video
            const videoWidth = cameraStream.value.videoWidth;
            const videoHeight = cameraStream.value.videoHeight;

            // Calculate the square size (use the smaller dimension)
            const size = Math.min(videoWidth, videoHeight);

            // Set canvas to be 1:1 square
            canvas.width = size;
            canvas.height = size;

            // Calculate source position for center crop
            const sourceX = (videoWidth - size) / 2;
            const sourceY = (videoHeight - size) / 2;

            // Draw only the center square portion of the video onto the canvas
            ctx.drawImage(
                cameraStream.value,
                sourceX, sourceY, size, size,  // Source rectangle
                0, 0, size, size               // Destination rectangle
            );

            capturedImage.value = canvas.toDataURL("image/png");
        }
    }, 1000);
};

async function classifyImageClientSide(base64Image) {
    const cleanedBase64 = base64Image.replace(/^data:image\/(png|jpeg);base64,/, "");
    console.log("Image cleaned:", cleanedBase64);

    const res = await fetch("http://localhost:3001/api/gender-hijab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Image: cleanedBase64 })
    });

    const data = await res.json();

  if(gender.value === "lanang") {
    return "a single man"
  }
  
  // Check if female and hijab detected
  if (data.hijab && data.hijab.some(p => p.tagName === "hijab" && p.probability > 0.5)) {
    return "a single woman wearing a hijab";
  }

  return "a single woman"
}

const retakeCount = ref(0);

const retakePhoto = () => {
    if (retakeCount.value >= 1) {
        return;
    }

    capturedImage.value = null;
    loadCameraStream();
    retakeCount.value += 1;
}
const randomIndex34 = Math.random() < 0.5 ? 3 : 4;

const styles = {
    'ENTP_ENFP': `https://raw.githubusercontent.com/abdulist/jsonFiles/test-styles/images-style${randomIndex34}/ENTP_ENFP.png`,
    'ESFJ_ENFJ': `https://raw.githubusercontent.com/abdulist/jsonFiles/test-styles/images-style${randomIndex34}/ESFJ_ENFJ.png`,
    'ESTP_ESFP': `https://raw.githubusercontent.com/abdulist/jsonFiles/test-styles/images-style${randomIndex34}/ESTP_ESFP.png`,
    'INFJ_INFP': `https://raw.githubusercontent.com/abdulist/jsonFiles/test-styles/images-style${randomIndex34}/INFJ_INFP.png`,
    'INTJ_INTP': `https://raw.githubusercontent.com/abdulist/jsonFiles/test-styles/images-style${randomIndex34}/INTJ_INTP.png`
};

let selectedStyle = '';
let selectedStylePrompt = '';
let selectedNegativePrompt = '';

const chooseStyle = () => {
    if (genderPrompt === null){
        alert("no gender detected!");
        return
    } else {
    const randomIndex = Math.floor(Math.random() * 9);
    switch (personality.value) {
        default:
            selectedStyle = styles['ENTP_ENFP'];
            videoFile.value = video1;
            imageCoord.value = "50:245";
            musicFile.value = ENTP_ENFP[randomIndex];
            selectedStylePrompt = `${genderPrompt} with a comic book-style sky with a bright, vivid blue background and scattered white cumulus clouds outlined in black. The scene should include halftone dot patterns, sketch-style brush strokes, and a retro pop art aesthetic. The clouds should have soft, rounded shapes with subtle blue shading and be spread across a dynamic diagonal composition.`;
            selectedNegativePrompt = "2 person, two humans, multiple people, non human object, faceless human, realistic, photorealistic, hyperrealistic, cinematic, soft shadows, smooth gradients, painterly, watercolor, oil painting, 3D render, desaturated, muted colors, low contrast, fog, haze, motion blur, natural lighting, detailed texture, photographic clouds, overcast sky, text, watermark, logo, asymmetry";
            break;
        case "ESFJ":
            case "ENFJ":
                selectedStyle = styles['ESFJ_ENFJ'];
                videoFile.value = video2;
                imageCoord.value = "115:490";
                musicFile.value = ESFJ_ENFJ[randomIndex];
                selectedStylePrompt = `${genderPrompt} on a bold comic book-style sunburst with a bright yellow circular center and sharp yellow rays extending outward. The background should be a vivid teal color with halftone dot patterns and radiating black lines, evoking a vintage pop art or retro comic book vibe. The composition should be symmetrical and eye-catching, with high contrast and clean outlines.`;
                selectedNegativePrompt = "two persons, two humans, multiple people, non human object, faceless human, realistic, photorealistic, soft light, natural shadows, painterly, impressionism, pastel colors, low contrast, desaturated, blurry, muted tones, dull colors, smooth gradients, watercolor, cinematic, oil painting, 3D render, text, watermark, logo, blue sky, clouds, irregular layout, asymmetrical composition";
                break;
        case "ESTP":
            case "ESFP":
                selectedStyle = styles['ESTP_ESFP'];
                videoFile.value = video3;
                imageCoord.value = "115:415";
                musicFile.value = ESTP_ESFP[randomIndex];
                selectedStylePrompt = `${genderPrompt} on a dynamic comic book-style explosion in the gradient caramel with bright orange and yellow bubble, surrounded by dramatic black speed lines. Use a halftone dot pattern in the background with a caramel. The art style should be bold, vibrant, and high-energy, evoking retro pop art and vintage comic aesthetics.`;
                selectedNegativePrompt = "two persons, two humans, multiple people, non human object, faceless human, realistic, photorealistic, soft light, blurry, painterly, impressionism, pastel colors, low contrast, smooth gradients, desaturated, natural tones, dull colors, cinematic lighting, noise, text, watermark, logo, 3D render, muted lighting, monochrome, blue sky, clouds";
                break;
        case "INFJ":
            case "INFP":
                selectedStyle = styles['INFJ_INFP'];
                videoFile.value = video4;
                imageCoord.value = "175:440";
                musicFile.value = INFJ_INFP[randomIndex];
                selectedStylePrompt = `${genderPrompt} on a vibrant, stylized subway station rendered in a pop-art or comic book aesthetic, with bold green and yellow tones. Two trains are parked on either side of the empty platform, which stretches into a vanishing point in the distance. The ceiling is composed of glowing geometric panels, casting dynamic reflections on the polished floor. The entire scene has a retro-futuristic feel, with heavy linework and halftone textures enhancing the dramatic lighting.`;
                selectedNegativePrompt = "two persons, two humans, multiple people, non human object, faceless human, realistic, photographic, soft lighting, blurry, painterly, impressionist, natural colors, muted tones, watercolor, low contrast, smooth textures, noise, grain, pastel colors, blue tones, warm lighting, overcrowded, people, cluttered, text, logos, watermark, sky, clouds, sunlight";
                break;
        case "INTJ":
            case "INTP":
                selectedStyle = styles['INTJ_INTP'];
                videoFile.value = video5;
                imageCoord.value = "125:220";
                musicFile.value = INTJ_INTP[randomIndex];
                selectedStylePrompt = `${genderPrompt} with a comic book-style sky with a bright, vivid red background and red background city scape. include retro pop art aesthetic. The clouds should have soft, rounded shapes with subtle red shading and be spread across a dynamic diagonal composition.`;
                selectedNegativePrompt = "two persons, two humans, multiple people, non human object, faceless human, realistic, photorealistic, 3D render, CGI, low contrast, blurry, soft shadows, pastel colors, washed-out tones, natural lighting, overexposed, detailed textures, painterly, oil painting, watercolor, text, watermark, signature, low resolution, asymmetry";
                break;
        }
    }
    //    }
};

const editPhoto = async () => {
    try {
        chooseStyle();
        if (!selectedStyle) {
            console.error("Style not found for the selected personality");
            return;
        }

        console.log("editing...");
        console.log("Image URL:", imageUrl.value);
        console.log("Selected Style:", selectedStyle);
        console.log("Selected Style Prompt:", selectedStylePrompt);
        console.log("Selected Negative Prompt:", selectedNegativePrompt);

        const response = await fetch("http://localhost:3001/api/style-transfer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                image: imageUrl.value,
                style_image: selectedStyle,
                style_prompt: selectedStylePrompt,
                negative_prompt: selectedNegativePrompt
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
            console.log(data.images);
            const imageResponse = await fetch(data.images);
            const blob = await imageResponse.blob();
            editedImage.value = URL.createObjectURL(blob);
        } else {
            console.error('Error applying style transfer:', data.error);
        }
    } catch (error) {
        console.error("Error editing photo:", error);
    }
};

// const editVideo = async () => {
//     if (!videoFile.value || !editedImage.value) {
//         alert("Please select a video and an image!");
//         return;
//     }

//     const videoName = "input.mp4";
//     const overlayName = "overlay.png";
//     const outputName = "output.mp4";
//     const musik = "musik.mp3"

//     try {

//         const response = await fetch(editedImage.value);
//         const overlayBlob = await response.blob();
//         const overlayArrayBuffer = await overlayBlob.arrayBuffer();

//         ffmpeg.FS("writeFile", videoName, await fetchFile(videoFile.value));
//         ffmpeg.FS("writeFile", overlayName, new Uint8Array(overlayArrayBuffer));
//         ffmpeg.FS("writeFile", musik, await fetchFile(musicFile.value));

//         console.log("musicFile.value:", musicFile.value);
//         console.log("videoFile.value:", videoFile.value);

//         console.log(musicFile.value);

//         await ffmpeg.run(
//             "-i", videoName,
//             "-loop", "1",
//             "-t", "5",
//             "-i", overlayName,
//             "-i", musik,
//             "-filter_complex",
//             `[1:v] format=yuva420p, scale=495:495, fade=t=in:st=0:d=1:alpha=1 [ovl]; [0:v][ovl] overlay=${imageCoord.value}`,
//             "-map", "0:v",
//             "-map", "2:a",
//             "-c:v", "libx264",
//             "-preset", "veryfast",
//             "-crf", "23",
//             "-threads", "4",
//             "-b:v", "700k",
//             "-c:a", "aac",
//             "-shortest",
//             outputName
//         );

//         const files = ffmpeg.FS("readdir", "/");
//         if (!files.includes(outputName)) {
//             console.error("Output file not found after processing.");
//             return;
//         }

//         const outputData = ffmpeg.FS("readFile", outputName);
//         const outputBlob = new Blob([outputData.buffer], { type: "video/mp4" });

//         // downloadUrl.value = await uploadVideoFirestore(outputBlob, "test");

//         // console.log(downloadUrl);

//         outputUrl.value = URL.createObjectURL(outputBlob);
//     } catch (error) {
//         console.error("Error processing video:", error);
//         alert("There was an error processing the video.");
//     }
// };


const editVideo = async () => {
    const imageBlob = await fetch(editedImage.value).then(res => res.blob());
    const base64Image = await blobToBase64(imageBlob);

    try {
        const response = await fetch("http://localhost:3001/api/process-video", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                overlayImageUrl: base64Image,
                imageCoord: imageCoord.value
            })
        });

        const data = await response.json();
        if (data.success) {
            outputUrl.value = data.url;
        }

    } catch (error) {
        console.error("Error processing video:", error);
        alert("There was an error processing the video.");
    }
};


function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]); // Remove the data:image/... prefix
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

function stopCameraStream() {
    const videoElement = cameraStream.value;
    if (videoElement?.srcObject) {
        videoElement.srcObject.getTracks().forEach(track => track.stop());
        videoElement.srcObject = null;
    }
    if (videoElement) {
        videoElement.pause();
        videoElement.removeAttribute('src');
        videoElement.load();
    }
}

function clearTemporaryData() {
    stopCameraStream();

  capturedImage.value = null;
  editedImage.value = null;
  videoFile.value = null;
  imageCoord.value = null;
  personality.value = null;
  genderPrompt = null;
  selectedStyle = null;
}

const goToResultPage = () => {
    if (outputUrl.value) {
        clearTemporaryData();

        const functionUrl = `https://getvideo-jvbmtds7iq-uc.a.run.app/?name=${downloadUrl.value}`

        router.push({ name: "Result", query: { videoUrl: outputUrl.value, downloadUrl: functionUrl } });
    } else {
        alert("Please finish editing the video first.");
    }
};

const process = async () => {
    isLoading.value = true;
    try {
        // console.log("Processing...");
        const detectedGender = await classifyImageClientSide(capturedImage.value);
        genderPrompt = detectedGender;
        await editPhoto();
        await editVideo();
        goToResultPage();
    } finally {
        isLoading.value = false;
    }
};

watch(isLoading, async (val) => {
    if (val) {
        await nextTick();
        if (lottieContainer.value) {
            lottie.loadAnimation({
                container: lottieContainer.value,
                renderer: 'svg',
                loop: true,
                autoplay: true,
                animationData: loadingAnimation, // pakai animationData, bukan path
            });
        }
    }
});

</script>

<template>
    <div class="app-container">
        <img src="../assets/normal-bg.png" class="background-image" />


        <div v-if="isLoading" class="loading-overlay">
            <div ref="lottieContainer" class="lottie-player"></div>
            <p>Processing your music personality...</p>
        </div>

        <div class="overlay">
            <div class="top-bar">
                <img src="../assets/mld-logo.png" class="logo" />
                <img src="../assets/art-n-sound.png" class="logo" />
            </div>
            <div v-show="!isLoading">
                <div class="title-text">
                    <h1>STRIKE A POSE!</h1>
                </div>
                <div v-if="isCountingDown" class="countdown-display">
                    {{ countdown }}
                </div>

                <div v-if="!capturedImage" class="camera-container">
                    <video class="camera-preview" ref="cameraStream" autoplay></video>
                    <div class="button-wrapper">
                        <button class="action-button" @click="capturePhoto">TAKE A PHOTO</button>
                    </div>
                </div>

                <div v-else class="preview-container">
                    <img :src="imageUrl" alt="Captured Image" class="preview-image" />
                    <button id="retake-photo" class="action-button" @click="retakePhoto" :disabled="retakeCount >= 1">
                        RE-TAKE PHOTO
                    </button>
                    <button class="action-button" @click="process">S U B M I T</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');

* {
    font-family: 'Montserrat', sans-serif;
}

.app-container {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
}

.background-image {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 0;
}

.overlay {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 20px;
    box-sizing: border-box;
    color: white;
    text-align: center;
    overflow-y: auto;
    max-height: 100vh;
}

.top-bar {
    display: flex;
    justify-content: center;
    align-items: center;

    /* Animation properties */
    animation: buttonAppear 1s ease-out forwards;
    transform-origin: center;
    filter: blur(8px);
    opacity: 0;
    transform: scale(0.5);
}

.logo {
    width: 20%;
    height: auto;
    margin: 10px;
}

@keyframes buttonAppear {
    0% {
        transform: scale(0.5);
        filter: blur(8px);
        opacity: 0;
    }

    70% {
        transform: scale(1.05);
        filter: blur(2px);
        opacity: 0.8;
    }

    100% {
        transform: scale(1);
        filter: blur(0);
        opacity: 1;
    }
}

@keyframes buttonDisappear {
    0% {
        transform: scale(1);
        filter: blur(0px);
        opacity: 1;
    }

    100% {
        transform: scale(0.7);
        /* or go smaller if you want */
        filter: blur(6px);
        opacity: 0;
    }
}

.title-text {
    margin-top: 20px;
}

.title-text h1,
.title-text h2 {
    margin: 0;
    color: #B32024;
    font-weight: bold;

    /* Animation properties */
    animation: buttonAppear 1s ease-out forwards;
    transform-origin: center;
    filter: blur(8px);
    opacity: 0;
    transform: scale(0.5);
}

.camera-container video {
    border-radius: 12px;
    width: 400px;
    /* Set a specific width */
    height: 400px;
    /* Set the same value for height */
    object-fit: cover;
    /* This crops the video to fill the container */
    /* Animation properties */
    animation: buttonAppear 1s ease-out forwards;
    transform-origin: center;
    filter: blur(8px);
    opacity: 0;
    transform: scale(0.5);
}

.camera-container video {
    border-radius: 12px;
}

.camera-preview {
    width: 100%;
    border-radius: 12px;
    margin: 20px 0;
}

.button-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 12px;
}

/* Ukuran preview diperkecil */
.preview-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
}

.preview-container img {
    width: 400px;
    /* Set a specific width */
    height: 400px;
    /* Set the same value for height */
    border-radius: 12px;
    object-fit: cover;
    /* This crops the image to fill the container */
    /* Animation properties */
    animation: buttonAppear 1s ease-out forwards;
    transform-origin: center;
    filter: blur(8px);
    opacity: 0;
    transform: scale(0.5);
}

.countdown-display {
    font-size: 2.5rem;
    font-weight: bold;
    color: #B32024;
    margin: 10px 0;
}


video {
    width: 80%;
    max-width: 400px;
    border-radius: 12px;
    margin: 20px 0;
}

.action-button {
    margin-top: 1%;
    background-color: #f66200;
    border: none;
    padding: 12px 48px;
    border-radius: 24px;
    font-size: 1.5rem;
    font-weight: bold;
    cursor: pointer;
    color: #ffffff;
    transition: background-color 0.2s, transform 0.2s;
    align-self: center;
    width: 70%;

    /* Animation properties */
    animation: buttonAppear 1s ease-out forwards;
    transform-origin: center;
    filter: blur(8px);
    opacity: 0;
    transform: scale(0.5);
}

.action-button:hover {
    background-color: #ffffff;
    color: rgba(255, 127, 42, 100);
}

.action-button:disabled {
    background-color: #cccccc;
    color: #888888;
    cursor: not-allowed;
    opacity: 0.7;
}

.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9999;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: white;
    text-align: center;
    padding: 20px;
}

.lottie-player {
    width: 200px;
    height: 200px;
}
</style>