<script setup>
import { ref, onMounted, computed, watch, nextTick } from "vue";
import { useRouter, useRoute } from 'vue-router';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import lottie from 'lottie-web';
import loadingAnimation from '@/assets/loading.json';
import { uploadVideoFirestore } from "@/firebase/firestore";
import { v4 } from "uuid";
import video1 from "@/assets/video/ENTP-ENFP.mp4";
import video2 from "@/assets/video/ESFJ-ENFJ.mp4";
import video3 from "@/assets/video/ESTP-ESFP.mp4";
import video4 from "@/assets/video/INFJ-INFP.mp4";
import video5 from "@/assets/video/INTJ-INTP.mp4";
import { INTJ_INTP, ENTP_ENFP, ESFJ_ENFJ, ESTP_ESFP, INFJ_INFP } from "@/assets/music/index.js";

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

    capturingPhoto.value = true;
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
            capturingPhoto.value = false;
        }
    }, 1000);
};

async function classifyImageClientSide(base64Image) {
  const cleanedBase64 = base64Image.replace(/^data:image\/(png|jpeg);base64,/, "");
  updateProgress(15, "Processing Your Music Personality...");

  if(gender.value === "lanang") {
    updateProgress(25, "Processing Your Music Personality...");
    return "a single man with a normal skin tone"
  } else {

  const res = await fetch("http://localhost:3001/api/gender-hijab", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base64Image: cleanedBase64 })
  });
  updateProgress(30, "Processing Your Music Personality...");
  const data = await res.json();
  
  if (data.error) {
    console.error(data.error);
    updateProgress(35, "Failed to Processing Your Music Personality.");
    return;
  }
  
  // Check if female and hijab detected
  if (data.hijab && data.hijab.some(p => p.tagName === "hijab" && p.probability > 0.5)) {
    updateProgress(35, "Processing Your Music Personality...");
    return "a single woman wearing a hijab and normal skin tone";
  } else {
  updateProgress(35, "Processing Your Music Personality...");
  return "a single woman and normal skin tone"
    }
  }
}

const retakeCount = ref(0);
const capturingPhoto = ref(false);
const processingAI = ref(false);

const retakePhoto = () => {
    if (retakeCount.value >= 1) {
        return;
    }

    capturedImage.value = null;
    loadCameraStream();
    retakeCount.value += 1;
}
const randomNumberGenerator = Math.random() < 0.5 ? 1 : 2;

const styles = {
    'ENTP_ENFP': `https://raw.githubusercontent.com/abdulist/jsonFiles/test-styles/images-style-final-${randomNumberGenerator}/ENTP_ENFP.png`,
    'ESFJ_ENFJ': `https://raw.githubusercontent.com/abdulist/jsonFiles/test-styles/images-style-final-${randomNumberGenerator}/ESFJ_ENFJ.png`,
    'ESTP_ESFP': `https://raw.githubusercontent.com/abdulist/jsonFiles/test-styles/images-style-final-${randomNumberGenerator}/ESTP_ESFP.png`,
    'INFJ_INFP': `https://raw.githubusercontent.com/abdulist/jsonFiles/test-styles/images-style-final-${randomNumberGenerator}/INFJ_INFP.png`,
    'INTJ_INTP': `https://raw.githubusercontent.com/abdulist/jsonFiles/test-styles/images-style-final-${randomNumberGenerator}/INTJ_INTP.png`
};

let selectedStyle = '';
let selectedStylePrompt = '';
let selectedNegativePrompt = '';
let selectedSeed=null;
const lastSeedDigit = Math.floor(Math.random() * 9) + 1;

const chooseStyle = async () => {
    const response = await fetch("http://localhost:3001/api/detect-accessories-hair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            base64Image: imageUrl.value,
        })
    });

    const data = await response.json();

    console.log(data);

    if(data.glasses != 'NoGlasses') genderPrompt += ' wearing a glasses';

    if (genderPrompt === null){
        alert("no gender detected!");
        return
    } else {
    switch (personality.value) {
        default:
            const baseSeed1 = 2547370140;
            selectedStyle = styles['ENTP_ENFP'];
            musicFile.value = ENTP_ENFP[randomIndex];
            videoFile.value = video1; // Inserted the imported video
            imageCoord.value = "75:365";
            selectedStylePrompt = `a close up of ${genderPrompt} facing to camera, with a light smile, in a red futuristic neon-lit corridor with warm glowing red and orange lights, the corridor has a large windows on the sides reveal a cyberpunk cityscape at night with red neon lights and tall buildings`;
            selectedNegativePrompt = "multiple person, realistic, blurry, white light, white wall, white background, white stuff, white room, cool lights, bikini, lingerie, revealing clothing, skimpy outfit, swimsuit, overly exposed skin, excessive cleavage, provocative, seductive, erotic, indecent, lewd";
            selectedSeed = baseSeed1 + lastSeedDigit;
            break;
        case "ESFJ":
            case "ENFJ":
                const baseSeed2 = 3898553140;
                selectedStyle = styles['ESFJ_ENFJ'];
                musicFile.value = ESFJ_ENFJ[randomIndex];
                videoFile.value = video2; // Inserted the imported video
                imageCoord.value = "170:735";
                if(randomNumberGenerator === 1){
                    selectedStylePrompt = `a close up of ${genderPrompt}, standing and facing to camera, with a light smile, and professional DJ mixing table with vinyl turntables in the front.`;
                } else {
                    selectedStylePrompt = `a close up of ${genderPrompt}, standing and facing to camera, with a light smile, and professional DJ mixing table with vinyl turntables in the front with a circular sound chamber in the back.`;
                }
                selectedNegativePrompt = "multiple person, realistic, bikini, lingerie, revealing clothing, skimpy outfit, swimsuit, overly exposed skin, excessive cleavage, provocative, seductive, erotic, indecent, lewd";
                selectedSeed = baseSeed2 + lastSeedDigit;
                break;
        case "ESTP":
            case "ESFP":
                const baseSeed3 = 2044740130;
                selectedStyle = styles['ESTP_ESFP'];
                musicFile.value = ESTP_ESFP[randomIndex];
                videoFile.value = video3; // Inserted the imported video
                imageCoord.value = "170:625";
                selectedStylePrompt = `a close up of ${genderPrompt}, standing & facing to camera, with a light smile, on a wide dramatic concert stage filled with vivid orange lightning effects and glowing stage lights, surrounded by large Marshall amplifiers and microphones.`;
                selectedNegativePrompt = "multiple person, realistic, bikini, lingerie, revealing clothing, skimpy outfit, swimsuit, overly exposed skin, excessive cleavage, provocative, seductive, erotic, indecent, lewd";
                selectedSeed = baseSeed3 + lastSeedDigit;
                break;
        case "INFJ":
            case "INFP":
                const baseSeed4 = 2728907370;
                selectedStyle = styles['INFJ_INFP'];
                musicFile.value = INFJ_INFP[randomIndex];
                videoFile.value = video4; // Inserted the imported video
                imageCoord.value = "265:660";
                selectedStylePrompt = `a close up of ${genderPrompt}, standing facing to camera, with a light smile, in a futuristic green subway station`;
                selectedNegativePrompt = "multiple person, realistic, bikini, lingerie, revealing clothing, skimpy outfit, swimsuit, overly exposed skin, excessive cleavage, provocative, seductive, erotic, indecent, lewd";
                selectedSeed = baseSeed4 + lastSeedDigit;
                break;
        case "INTJ":
            case "INTP":
                const baseSeed5 = 394514902;
                selectedStyle = styles['INTJ_INTP'];
                musicFile.value = INTJ_INTP[randomIndex];
                videoFile.value = video5; // Inserted the imported video
                imageCoord.value = "185:330";
                selectedStylePrompt = `a close up of ${genderPrompt} standing facing to camera, with a light smile under a super cloudy blue sky, soft lighting, bunch of fluffy white Cumulonimbus clouds with depth and volume, atmospheric perspective, detailed sky background, dreamy atmosphere.`;
                selectedNegativePrompt = "multiple people, realistic, flat clouds, bikini, lingerie, revealing clothing, skimpy outfit, swimsuit, overly exposed skin, excessive cleavage, provocative, seductive, erotic, indecent, lewd";
                selectedSeed = baseSeed5 + lastSeedDigit;
                break;
        }
    }
};

const editPhoto = async () => {
    try {
        await chooseStyle();

        if (!selectedStyle) {
            console.error("Style not found for the selected personality");
            return;
        }

        //console.log("editing...");
        //console.log("Image URL:", imageUrl.value);
        console.log("Selected Style:", selectedStyle);
        console.log("Selected Style Prompt:", selectedStylePrompt);
        console.log("Selected Negative Prompt:", selectedNegativePrompt);
        updateProgress(60, "Processing Your Music Personality...");
        const response = await fetch("http://localhost:3001/api/style-transfer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                image: imageUrl.value,
                style_image: selectedStyle,
                style_prompt: selectedStylePrompt,
                negative_prompt: selectedNegativePrompt,
                seed: selectedSeed,
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        updateProgress(65, "Processing Your Music Personality...");
        const data = await response.json();
        if (data.success) {
            console.log(data.images);
            updateProgress(70, "Processing Your Music Personality...");
            editedImage.value = data.images;
        } else {
            console.error('Error applying style transfer:', data.error);
        }
    } catch (error) {
        console.error("Error editing photo:", error);
    }
};

// const editVideo = async () => {
//     updateProgress(70, "Processing Your Music Personality...");
//     try {
//         const response = await fetch("http://localhost:3001/api/process-video", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//                 imageCoord: imageCoord.value,
//                 overlayImageUrl: editedImage.value,
//                 personalityStyle: musicFile.value,
//                 username: name.value
//             })
//         });

//         const videoBlob = await response.blob();
//         const blobUrl = URL.createObjectURL(videoBlob);
//         updateProgress(80, "Processing Your Music Personality...");
//         if(blobUrl){
//             outputUrl.value = blobUrl;

//             const uid = v4();
//             const fileNameWithUuid = `${name.value.trim().replace(/\s+/g, '')}${uid}`;
//             const uploadVideo = await uploadVideoFirestore(videoBlob, fileNameWithUuid);
//             updateProgress(90, "Processing Your Music Personality...");
//             if(uploadVideo) downloadUrl.value = fileNameWithUuid;
//         } else {
//             throw new Error('Error while processing blob');
//         }
//     } catch (error) {
//         console.error("Error processing video:", error);
//         alert("There was an error processing the video.");
//     }
// };

const editVideo = async () => {
    if (!videoFile.value || !editedImage.value) {
        alert("Please select a video and an image!");
        return;
    }

    const videoName = "input.mp4";
    const overlayName = "overlay.png";
    const outputName = "output.mp4";
    const musik = "musik.mp3"

    try {
        
        //const response = aiResult;
        const response = await fetch(editedImage.value);
        const overlayBlob = await response.blob();
        const overlayArrayBuffer = await overlayBlob.arrayBuffer();
        updateProgress(80, "Processing Your Music Personality...");
        ffmpeg.FS("writeFile", videoName, await fetchFile(videoFile.value));
        ffmpeg.FS("writeFile", overlayName, new Uint8Array(overlayArrayBuffer));
        ffmpeg.FS("writeFile", musik, await fetchFile(musicFile.value));

        //console.log("musicFile.value:", musicFile.value);
        //console.log("videoFile.value:", videoFile.value);

        //console.log(musicFile.value);

        await ffmpeg.run(
            "-i", videoName,
            "-loop", "1",
            "-t", "5",
            "-i", overlayName,
            "-i", musik,
            "-filter_complex",
            `[1:v] format=yuva420p, scale=745:745, fade=t=in:st=0:d=1:alpha=1 [ovl]; [0:v][ovl] overlay=${imageCoord.value}`,
            "-map", "0:v",
            "-map", "2:a",
            "-c:v", "libx264",
            "-preset", "ultrafast",
            "-crf", "23",
            "-threads", "4",
            "-b:v", "700k",
            "-c:a", "aac",
            "-shortest",
            outputName
        );

        updateProgress(85, "Processing Your Music Personality...");

        const files = ffmpeg.FS("readdir", "/");
        if (!files.includes(outputName)) {
            console.error("Output file not found after processing.");
            return;
        }

        const outputData = ffmpeg.FS("readFile", outputName);
        const outputBlob = new Blob([outputData.buffer], { type: "video/mp4" });

        updateProgress(95, "Processing Your Music Personality...");
        const uid = v4();
        const fileNameWithUuid = `${name.value.trim().replace(/\s+/g, '')}${uid}`;
        const uploadVideo = await uploadVideoFirestore(outputBlob, fileNameWithUuid);

        if(uploadVideo) downloadUrl.value = fileNameWithUuid;

        outputUrl.value = URL.createObjectURL(outputBlob);
    } catch (error) {
        console.error("Error processing video:", error);
        alert("There was an error processing the video.");
    }
};

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
    processingAI.value = true;
    isLoading.value = true;
    updateProgress(0, "Processing Your Music Personality...");
    try {
        console.log("Processing...");
        const detectedGender = await classifyImageClientSide(capturedImage.value);
        genderPrompt = detectedGender;
        await editPhoto();

        await editVideo();

        goToResultPage();
    } finally {
        isLoading.value = false;
        processingAI.value = false;
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
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <div class="app-container" @contextmenu.prevent>
        <img src="../assets/normal-bg.png" class="background-image" />

        <div v-if="isLoading" class="loading-overlay">
            <div ref="lottieContainer" class="lottie-player"></div>
            <p id="loading-status">Processing Your Music Personality...</p>

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
                        <button class="action-button" :disabled="capturingPhoto || isCountingDown" @click="capturePhoto">TAKE A PHOTO</button>
                    </div>
                </div>

                <div v-else class="preview-container">
                    <img :src="imageUrl" alt="Captured Image" class="preview-image" />
                    <button id="retake-photo" class="action-button" @click="retakePhoto" :disabled="retakeCount >= 1">
                        RE-TAKE PHOTO
                    </button>
                    <button class="action-button" :disabled="processingAI" @click="process">S U B M I T</button>
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