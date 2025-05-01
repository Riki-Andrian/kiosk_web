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
import mld_kiosk from "@/assets/mld_kiosk.mp3"
import loadingAnimation from '@/assets/loading.json';
import { INTJ_INTP, ENTP_ENFP, ESFJ_ENFJ, ESTP_ESFP, INFJ_INFP } from "@/assets/music/index.js";

const router = useRouter();
const route = useRoute();

const cameraStream = ref(null);
const capturedImage = ref(null);

const personality = ref(route.params.personality);
const editedImage = ref(null);
const imageUrl = computed(() => capturedImage.value);

const ffmpeg = createFFmpeg({ log: true });
const videoFile = ref(null);
let musicFile = ref(null);
const outputUrl = ref(null);
const userName = ref("John Doe");
const imageCoord = ref(null);
const isLoading = ref(false);
const lottieContainer = ref(null);

const countdown = ref(3);
const isCountingDown = ref(false);
let countdownInterval = null;

const loadComponent = async () => {
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


const retakeCount = ref(0);

const retakePhoto = () => {
    if (retakeCount.value >= 1) {
        return;
    }
    
    capturedImage.value = null;
    loadCameraStream();
    retakeCount.value += 1;
}

const styles = {
    'ENTP_ENFP': 'https://raw.githubusercontent.com/abdulist/jsonFiles/test-styles/images-style/ENTP_ENFP.jpg',
    'ESFJ_ENFJ': 'https://raw.githubusercontent.com/abdulist/jsonFiles/test-styles/images-style/ESFJ_ENFJ.jpg',
    'ESTP_ESFP': 'https://raw.githubusercontent.com/abdulist/jsonFiles/test-styles/images-style/ESTP_ESFP.jpg',
    'INFJ_INFP': 'https://raw.githubusercontent.com/abdulist/jsonFiles/test-styles/images-style/INFJ_INFP.jpg',
    'INTJ_INTP': 'https://raw.githubusercontent.com/abdulist/jsonFiles/test-styles/images-style/INTJ_INTP.jpg'
};

let selectedStyle = '';

const chooseStyle = () => {
    const randomIndex = Math.floor(Math.random() * 9);
    switch (personality.value) {
        case "ENTP":
        case "ENFP":
            selectedStyle = styles['ENTP_ENFP'];
            videoFile.value = video1;
            imageCoord.value = "75:380";
            musicFile.value = ENTP_ENFP[randomIndex];
            break;
        case "ESFJ":
        case "ENFJ":
            selectedStyle = styles['ESFJ_ENFJ'];
            videoFile.value = video2;
            imageCoord.value = "185:737";
            musicFile = ESFJ_ENFJ[randomIndex];
            break;
        case "ESTP":
        case "ESFP":
            selectedStyle = styles['ESTP_ESFP'];
            videoFile.value = video3;
            imageCoord.value = "200:645";
            musicFile.value = ESTP_ESFP[randomIndex];
            break;
        case "INFJ":
        case "INFP":
            selectedStyle = styles['INFJ_INFP'];
            videoFile.value = video4;
            imageCoord.value = "350:685";
            musicFile.value = INFJ_INFP[randomIndex];
            break;
        case "INTJ":
        case "INTP":
            selectedStyle = styles['INTJ_INTP'];
            videoFile.value = video5;
            imageCoord.value = "185:350";
            musicFile.value = INTJ_INTP[randomIndex];
            break;
        default:
            selectedStyle = null;
            videoFile.value = videoSrc;
            break;
    }
};

// const chooseStyle = () => {
//     const randomIndex = Math.floor(Math.random() * 9);
//     const indexStr = `${randomIndex + 1}.mp3`;

//     switch (personality.value) {
//         case "ENTP":
//         case "ENFP":
//             selectedStyle = styles['ENTP_ENFP'];
//             videoFile.value = "video/video1.mp4";
//             imageCoord.value = "75:380";
//             musicFile.value = `ENTP_ENFP/${indexStr}`;
//             break;
//         case "ESFJ":
//         case "ENFJ":
//             selectedStyle = styles['ESFJ_ENFJ'];
//             videoFile.value = "video/video2.mp4";
//             imageCoord.value = "185:737";
//             musicFile.value = `ESFJ_ENFJ/${indexStr}`;
//             break;
//         case "ESTP":
//         case "ESFP":
//             selectedStyle = styles['ESTP_ESFP'];
//             videoFile.value = "video/video3.mp4";
//             imageCoord.value = "200:645";
//             musicFile.value = `ESTP_ESFP/${indexStr}`;
//             break;
//         case "INFJ":
//         case "INFP":
//             selectedStyle = styles['INFJ_INFP'];
//             videoFile.value = "video/video4.mp4";
//             imageCoord.value = "350:685";
//             musicFile.value = `INFJ_INFP/${indexStr}`;
//             break;
//         case "INTJ":
//         case "INTP":
//             selectedStyle = styles['INTJ_INTP'];
//             videoFile.value = "video/video5.mp4";
//             imageCoord.value = "185:350";
//             musicFile.value = `INTJ_INTP/${indexStr}`;
//             break;
//         default:
//             selectedStyle = null;
//             videoFile.value = null;
//             musicFile.value = null;
//             break;
//     }
// };

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

        const response = await fetch("http://localhost:3001/api/style-transfer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                image: imageUrl.value,
                style_image: selectedStyle
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
        
        const response = await fetch(editedImage.value);
        const overlayBlob = await response.blob();
        const overlayArrayBuffer = await overlayBlob.arrayBuffer();

        ffmpeg.FS("writeFile", videoName, await fetchFile(videoFile.value));
        ffmpeg.FS("writeFile", overlayName, new Uint8Array(overlayArrayBuffer));
        ffmpeg.FS("writeFile", musik, await fetchFile(musicFile.value));

        console.log(musicFile.value);

        await ffmpeg.run(
            "-i", videoName,
            "-loop", "1", 
            "-t", "5",
            "-i", overlayName,
            "-i", musik,
            "-filter_complex",
            `[1:v]format=rgba,scale=360:360,fade=t=in:st=0:d=1:alpha=1[ovl];[0:v][ovl]overlay=${imageCoord.value}:enable='between(t,0,5)'[v]`,
            "-map", "[v]",
            "-map", "2:a",
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p", // Add this for better compatibility
            "-preset", "ultrafast",
            "-crf", "23",
            "-threads", "4", 
            "-b:v", "700k",
            "-c:a", "aac",
            "-shortest",
            outputName
        );

        const files = ffmpeg.FS("readdir", "/");
        if (!files.includes(outputName)) {
            console.error("Output file not found after processing.");
            return;
        }

        const outputData = ffmpeg.FS("readFile", outputName);
        const outputBlob = new Blob([outputData.buffer], { type: "video/mp4" });
        outputUrl.value = URL.createObjectURL(outputBlob);

    } catch (error) {
        console.error("Error processing video:", error);
        alert("There was an error processing the video.");
    }
};

// const editVideo = async () => {
//     if (!videoFile.value || !editedImage.value || !musicFile.value) {
//         alert("Please select a video, image overlay, and music!");
//         return;
//     }

//     const videoName = videoFile.value;
//     const overlayName = "overlay.png";
//     const musicName = musicFile.value;
//     const outputName = "output.mp4";
    
//     try {
//         const formData = new FormData();
//         formData.append("video", videoName);
//         formData.append("music", musicName);
//         formData.append("overlay", overlayName);
//         formData.append("x", imageCoord.value.split(":")[0]);
//         formData.append("y", imageCoord.value.split(":")[1]);

//         // Memanggil backend API untuk memproses video
//         const response = await fetch("http://localhost:3001/api/edit-video", {
//             method: "POST",
//             body: formData
//         });

//         if (!response.ok) {
//             throw new Error(`Error: ${response.statusText}`);
//         }

//         const data = await response.json();
//         if (data.success) {
//             // Menampilkan hasil video setelah diproses
//             outputUrl.value = data.videoUrl;
//             console.log("Video URL:", data.videoUrl);
//         } else {
//             console.error("Failed to edit video:", data.message);
//         }
//     } catch (error) {
//         console.error("Error editing video:", error);
//         alert("There was an error processing the video.");
//     }
// };


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

}

const goToResultPage = () => {
    if (outputUrl.value) {
        clearTemporaryData();
        router.push({ name: "Result", query: { videoUrl: outputUrl.value } });
    } else {
        alert("Please finish editing the video first.");
    }
};

const process = async () => {
    isLoading.value = true;
    try {
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
            <p>Processing your video, please wait...</p>
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
                    <button 
                        id="retake-photo" 
                        class="action-button" 
                        @click="retakePhoto" 
                        :disabled="retakeCount >= 1">
                        RE-TAKE PHOTO
                    </button>
                    <button class="action-button" @click="process">EDIT</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');

*{
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
        transform: scale(0.7); /* or go smaller if you want */
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
    width: 400px;    /* Set a specific width */
    height: 400px;   /* Set the same value for height */
    object-fit: cover; /* This crops the video to fill the container */
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
    width: 400px; /* Set a specific width */
    height: 400px; /* Set the same value for height */
    border-radius: 12px;
    object-fit: cover; /* This crops the image to fill the container */
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
