<script setup>
import { ref, onMounted, computed, watch, nextTick } from "vue";
import { useRouter, useRoute } from 'vue-router';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import lottie from 'lottie-web';
import loadingAnimation from '@/assets/loading.json';
import { uploadVideoFirestore } from "@/firebase/firestore";
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

const progressBar = ref(null);

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
  updateProgress(25, "Lagi siapin datanya...");

  if(gender.value === "lanang") {
    updateProgress(35, "Okee, datanya udah siap!");
    return "a single man"
  } else {

  const res = await fetch("http://localhost:3001/api/gender-hijab", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base64Image: cleanedBase64 })
  });
  updateProgress(30, "Lagi siapin datanya...");
  const data = await res.json();
  
  if (data.error) {
    console.error(data.error);
    updateProgress(35, "Aduhh ada kendala teknis nih...");
    return;
  }
  
  // Check if female and hijab detected
  if (data.hijab && data.hijab.some(p => p.tagName === "hijab" && p.probability > 0.5)) {
    updateProgress(35, "Okee, datanya udah siap!");
    return "a single woman wearing a hijab";
  } else {
  updateProgress(35, "Okee, datanya udah siap!");
  return "a single woman"
    }
  }
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
const randomIndex34 = Math.random() < 0.5 ? 4 : 5;

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

        switch (personality.value) {
            case "ESFJ":
                case "ENFJ":
                    selectedStyle = styles['ESFJ_ENFJ'];
                    musicFile.value = 'ESFJ-ENFJ';
                    imageCoord.value = "170:735";
                    selectedStylePrompt = `${genderPrompt} on A vivid, symmetrical abstract design resembling a radiant sunburst or energy core. The central area glows with warm yellow and orange hues, surrounded by intricate concentric circular patterns and dotted lines in a cool turquoise and teal background. The overall composition is balanced, futuristic, and energetic, with a retro-techno or sacred geometry aesthetic. Clean lines and high detail, with a harmonious color palette and a digital-art style.`;
                    selectedNegativePrompt = "multiple people, faces, realistic, CGI, 3D render, human figures, animals, landscapes, realistic textures, organic shapes, cluttered background, muted colors, blurry edges, low resolution, text, watermark, uneven symmetry, natural scenery, painterly brush strokes";
                    break;
            case "ESTP":
                case "ESFP":
                    selectedStyle = styles['ESTP_ESFP'];
                    musicFile.value = 'ESTP-ESFP';
                    imageCoord.value = "170:625";
                    selectedStylePrompt = `${genderPrompt} on A dynamic, high-energy explosion rendered in an abstract, stylized digital art style. Bright, intense bursts of yellow, orange, and red dominate the scene, radiating outward from a central impact point with sharp streaks, scattered sparks, and smoke plumes. The background fades into deep reds and blacks, evoking a sense of heat, motion, and dramatic impact. Highly saturated colors and expressive brushwork create a vivid, cinematic, and chaotic atmosphere.`;
                    selectedNegativePrompt = "multiple people, human figures, realistic, CGI, 3D render, animals, soft colors, calm scenery, low contrast, muted tones, water, sky, green nature, buildings, urban setting, realism, photo style, pastel palette, blurry, text, watermark, symmetrical patterns";
                    break;
            case "INFJ":
                case "INFP":
                    selectedStyle = styles['INFJ_INFP'];
                    musicFile.value = 'INFJ-INFP';
                    imageCoord.value = "265:660";
                    selectedStylePrompt = `${genderPrompt} on A futuristic, symmetrical underground subway tunnel rendered in a stylized digital art style. The tunnel is bathed in neon green and cyan lighting, with smooth, curved architecture and glowing ceiling panels. The perspective leads to a bright white light at the vanishing point, creating a sense of depth and mystery. Reflections on the polished floor enhance the immersive, sci-fi atmosphere. No people are present, giving the space a quiet, surreal, and otherworldly vibe.`;
                    selectedNegativePrompt = "multiple people, crowd, human figures, realistic, CGI, 3D render, cluttered elements, graffiti, decay, dark lighting, low detail, messy textures, natural scenery, animals, medieval architecture, soft lighting, warm tones, low resolution, text, watermark, distorted proportions";
                    break;
            case "INTJ":
                case "INTP":
                    selectedStyle = styles['INTJ_INTP'];
                    musicFile.value = 'INTJ-INTP';
                    imageCoord.value = "185:330";
                    selectedStylePrompt = `${genderPrompt} on A stylized futuristic cityscape at sunset, dominated by vivid red, orange, and crimson hues. Tall skyscrapers rise against a dramatic sky with scattered dark clouds, glowing with a moody yet energized atmosphere. Neon-lit buildings, streetlights, and car headlights illuminate the bustling streets below. The perspective is street-level, looking toward the towering skyline, with a slight cinematic glow. A blend of cyberpunk and modern anime aesthetics, with rich contrast and deep shadows.`;
                    selectedNegativePrompt = "multiple people, crowd scenes, realistic, CGI, 3D render, rural landscapes, daytime blue skies, pastel colors, nature-dominated backgrounds, low contrast, overly dark or stormy clouds, blurry details, low resolution, medieval buildings, graffiti, animals, text, watermark";
                    break;
            default:
                selectedStyle = styles['ENTP_ENFP'];
                musicFile.value = 'ENTP-ENFP';
                imageCoord.value = "75:365";
                selectedStylePrompt = `${genderPrompt} on A vibrant, serene anime-style sky with deep blue tones and soft, fluffy big cumulus clouds scattered across the horizon. The lighting suggests a bright, sunny day with dynamic cloud formations, giving a peaceful and dreamy atmosphere. The clouds vary in size, with a few towering clouds in the foreground and wispy cirrus clouds stretching into the distance. High detail and soft color gradients in a scenic, tranquil landscape.`;
                selectedNegativePrompt = "multiple people, crowd, group of people, realistic, CGI, 3D render, human figures, cityscape, buildings, vehicles, dark sky, night, rain, storm, low resolution, blurry, grainy, text, watermark, distorted shapes, unrealistic cloud formations, fantasy creatures";
                break;
        }
    }
};

const editPhoto = async () => {
    try {
        chooseStyle();
        if (!selectedStyle) {
            console.error("Style not found for the selected personality");
            return;
        }

        //console.log("editing...");
        //console.log("Image URL:", imageUrl.value);
        console.log("Selected Style:", selectedStyle);
        console.log("Selected Style Prompt:", selectedStylePrompt);
        console.log("Selected Negative Prompt:", selectedNegativePrompt);
        updateProgress(50, "Lagi proses foto lu, tungguin ya...");
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
        updateProgress(65, "Kalem ya, sedikit lagi...");
        const data = await response.json();
        if (data.success) {
            //console.log(data.images);
            editedImage.value = data.images;
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
    const base64Image = editedImage.value;
    updateProgress(70, "Foto dah siap, tinggal proses Video lu...");
    try {
        const response = await fetch("http://localhost:3001/api/process-video", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                imageCoord: imageCoord.value,
                overlayImageUrl: base64Image,
                personalityStyle: musicFile.value
            })
        });

        const videoBlob = await response.blob();
        const blobUrl = URL.createObjectURL(videoBlob);
        updateProgress(80, "lagi Upload video lu supaya bisa di download...");
        if(blobUrl){
            outputUrl.value = blobUrl;

            const uid = v4();
            const fileNameWithUuid = `${name.value.trim().replace(/\s+/g, '')}${uid}`;
            const uploadVideo = await uploadVideoFirestore(videoBlob, fileNameWithUuid);
            updateProgress(90, "Dikiiiiit lagi");
            if(uploadVideo) downloadUrl.value = fileNameWithUuid;
        } else {
            throw new Error('Error while processing blob');
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

function updateProgress(percent, message) {
    if (!progressBar.value) return;
    progressBar.value.style.width = percent + "%";
    document.getElementById("loading-status").textContent = message;
}


const process = async () => {
    isLoading.value = true;
    updateProgress(0, "Mulai proses...");
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
            <p id="loading-status">Memproses Music Personality Lu</p>

            <!-- Progress Bar Container -->
            <div class="progress-container" id="progress-container">
                <div ref="progressBar" class="progress-bar" id="progress-bar"></div>
            </div>
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

.progress-container {
    width: 80%;
    height: 5%;
    border-radius: 20px;
    overflow: hidden;
    margin: 16px auto 0 auto;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
}

.progress-bar {
    z-index: 5;
    height: 100%;
    width: 0%;
    background-color: #f66200;
    transition: width 0.4s ease;
    border-radius: 20px;
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

.loading-overlay p {
    margin-top: 5%;
    font-size: 1rem;
    font-weight: bold;
}

.lottie-player {
    width: 200px;
    height: 200px;
}
</style>