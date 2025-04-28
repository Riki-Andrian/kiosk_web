<script setup>
import { ref, onMounted, computed, watch, nextTick } from "vue";
import { useRouter, useRoute } from 'vue-router';
import PreviewPicture from "./PreviewPicture.vue";
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import lottie from 'lottie-web';
import videoSrc from "@/assets/template.mp4";
import video1 from "@/assets/video/ENTP-ENFP.mp4";
import video2 from "@/assets/video/ESFJ-ENFJ.mp4";
import video3 from "@/assets/video/ESTP-ESFP.mp4";
import video4 from "@/assets/video/INFJ-INFP.mp4";
import video5 from "@/assets/video/INTJ-INTP.mp4";
import mld_kiosk from "@/assets/mld_kiosk.mp3"
import loadingAnimation from '@/assets/loading.json';

const router = useRouter();
const route = useRoute();

const cameraStream = ref(null);
const capturedImage = ref(null);

const personality = ref(route.params.personality);
const editedImage = ref(null);
const imageUrl = computed(() => capturedImage.value);

const ffmpeg = createFFmpeg({ log: true });
const videoFile = ref(null);
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

            canvas.width = cameraStream.value.videoWidth;
            canvas.height = cameraStream.value.videoHeight;

            ctx.drawImage(cameraStream.value, 0, 0, canvas.width, canvas.height);

            capturedImage.value = canvas.toDataURL("image/png");
        }
    }, 1000);
};


const retakePhoto = () => {
    capturedImage.value = null;
    loadCameraStream();
}

const styles = {
    'ENTP_ENFP': 'https://raw.githubusercontent.com/Riki-Andrian/style_kiosk/main/styles/ENTP_ENFP.jpg',
    'ESFJ_ENFJ': 'https://raw.githubusercontent.com/Riki-Andrian/style_kiosk/main/styles/ESFJ_ENFJ.jpg',
    // 'ESFJ_ENFJ': 'https://raw.githubusercontent.com/Riki-Andrian/style_kiosk/main/style1/style2.jpg',
    'ESTP_ESFP': 'https://raw.githubusercontent.com/Riki-Andrian/style_kiosk/main/styles/ESTP_ESFP.jpg',
    'INFJ_INFP': 'https://raw.githubusercontent.com/Riki-Andrian/style_kiosk/main/styles/INFJ_INFP.jpg',
    'INTJ_INTP': 'https://raw.githubusercontent.com/Riki-Andrian/style_kiosk/main/styles/INTJ_INTP.jpg'
};

let selectedStyle = '';

const chooseStyle = () => {
    switch (personality.value) {
        case "ENTP":
        case "ENFP":
            selectedStyle = styles['ENTP_ENFP'];
            videoFile.value = video1;
            imageCoord.value = "75:380";
            break;
        case "ESFJ":
        case "ENFJ":
            selectedStyle = styles['ESFJ_ENFJ'];
            videoFile.value = video2;
            imageCoord.value = "185:737";
            break;
        case "ESTP":
        case "ESFP":
            selectedStyle = styles['ESTP_ESFP'];
            videoFile.value = video3;
            imageCoord.value = "200:645";
            break;
        case "INFJ":
        case "INFP":
            selectedStyle = styles['INFJ_INFP'];
            videoFile.value = video4;
            imageCoord.value = "350:685";
            break;
        case "INTJ":
        case "INTP":
            selectedStyle = styles['INTJ_INTP'];
            videoFile.value = video5;
            imageCoord.value = "185:350";
            break;
        default:
            selectedStyle = null;
            videoFile.value = videoSrc;
            break;
    }
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
        ffmpeg.FS("writeFile", musik, await fetchFile(mld_kiosk));

        await ffmpeg.run(
            "-i", videoName,
            "-loop", "1",
            "-t", "5",
            "-i", overlayName,
            "-i", musik,
            "-filter_complex",
            `[1:v] format=yuva420p, scale=720:720, fade=t=in:st=0:d=1:alpha=1 [ovl]; [0:v][ovl] overlay=${imageCoord.value}`,
            "-map", "0:v",
            "-map", "2:a",
            "-c:v", "libx264",
            "-preset", "veryfast",
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
        await goToResultPage();
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
        <img src="../assets/Background.png" class="background-image" />


        <div v-if="isLoading" class="loading-overlay">
            <div ref="lottieContainer" class="lottie-player"></div>
            <p>Processing your video, please wait...</p>
        </div>

        <div class="overlay">
            <div class="top-bar">
                <img src="../assets/art & sound logo.svg" class="logo" />
                <img src="../assets/mld logo.svg" class="logo" />
            </div>
            <div v-show="!isLoading">
                <div class="title-text">
                    <h1>GET YOUR ALBUM COVER.</h1>
                    <h2>STRIKE A POSE!</h2>
                </div>
                <div v-if="isCountingDown" class="countdown-display">
                    {{ countdown }}
                </div>

                <div v-if="!capturedImage" class="camera-container">
                    <video ref="cameraStream" autoplay></video>
                    <div class="button-wrapper">
                        <button class="action-button" @click="capturePhoto">Take a Photo</button>
                    </div>
                </div>

                <div v-else class="preview-container">
                    <PreviewPicture :image="capturedImage" />
                    <button class="action-button" @click="retakePhoto">Take another picture</button>
                    <button class="action-button" @click="process">Edit</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
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
    justify-content: space-between;
    align-items: center;
}

.logo {
    width: 80px;
    height: auto;
}

.title-text {
    margin-top: 20px;
}

.title-text h1,
.title-text h2 {
    margin: 0;
}


.camera-container video {
    width: 100%;
    max-width: 440px;
    border-radius: 12px;
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
    max-width: 80%;
    max-height: 400px;
    object-fit: contain;
    border-radius: 12px;
}

.countdown-display {
    font-size: 2rem;
    font-weight: bold;
    color: white;
    text-shadow: 2px 2px 8px black;
    margin: 10px 0;
}


video {
    width: 80%;
    max-width: 400px;
    border-radius: 12px;
    margin: 20px 0;
}

.action-button {
    background-color: rgba(255, 127, 42, 100);
    color: #fff;
    border: none;
    padding: 12px 24px;
    border-radius: 24px;
    font-weight: bold;
    cursor: pointer;
    margin: 10px;
    font-size: 1.3rem;
}

.action-button:hover {
    background-color: #ffffff;
    color: rgba(255, 127, 42, 100);
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
