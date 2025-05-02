<script setup>
import { useRouter, useRoute } from 'vue-router';
import { ref, onMounted } from 'vue';
import { downloadVideo } from '@/firebase/firestore';
import QRcode from "qrcode";

const router = useRouter();
const route = useRoute();
const videoUrl = ref(route.query.videoUrl);
const downloadUrl = ref(route.query.downloadUrl);
const qrUrl = ref(null);

function goToNext() {
  router.replace('/');
}

const generateQR = async () => {
  try {
    qrUrl.value = await QRcode.toDataURL(downloadUrl.value);
  } catch (error) {
    console.error(error);
  }
}

onMounted(async () => {
  await generateQR();
});
</script>


<template>
  <div class="app-container">
    <img src="../assets/reverse-bg.png" class="background-image" />

    <div class="overlay">
      <div class="title-text">
        <h1>YOUR RESULT</h1>
        <!--<video src="../assets/video/ENTP-ENFP.mp4" class="responsive-video" autoplay muted controls></video>-->
        <video v-if="videoUrl" :src="videoUrl" autoplay loop controls class="responsive-video" />
        <p v-else>Video URL not found.</p> 
        <div v-if="videoUrl" class="qr-and-button">
          <div class="qr-container">
            <img :src="qrUrl" alt="QR Code" class="qr-code" />
            <p class="qr-text">Scan to<br>Download</p>
          </div>
        <button class="next-button" @click="goToNext">Home</button>
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
}

.title-text {
  margin-top: auto;
  margin-bottom: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
}

.title-text h1 {
  font-size: 1.5rem;
  margin: 0;
  font-weight: bold;
  text-transform: uppercase;

  animation: buttonAppear 1s ease-out forwards;
    transform-origin: center;
    filter: blur(8px);
    opacity: 0;
    transform: scale(0.5);
}

.result-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
}

.responsive-video {
  max-width: 80vw;
  max-height: 60vh;
  width: auto;
  height: auto;
  border-radius: 10px;

  animation: buttonAppear 1s ease-out forwards;
    transform-origin: center;
    filter: blur(8px);
    opacity: 0;
    transform: scale(0.5);
}

.qr-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1.5rem;
  gap: 1rem;
  /* jarak antara gambar dan teks */
}

.qr-and-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.qr-code {
  width: 60%;
  height: 60%;
  border-radius: 8px;

    animation: buttonAppear 1s ease-out forwards;
    transform-origin: center;
    filter: blur(8px);
    opacity: 0;
    transform: scale(0.5);
}

.qr-text {
  font-size: 1.2rem;
  line-height: 1.2;
  color: black;
  text-align: left;
  font-weight: bold;

    animation: buttonAppear 1s ease-out forwards;
    transform-origin: center;
    filter: blur(8px);
    opacity: 0;
    transform: scale(0.5);
}

.next-button {
  background-color: rgba(255, 127, 42, 1);
  border: none;
  padding: 14px 88px;
  border-radius: 24px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  color: #ffffff;
  transition: background-color 0.2s, transform 0.2s;

    animation: buttonAppear 1s ease-out forwards;
    transform-origin: center;
    filter: blur(8px);
    opacity: 0;
    transform: scale(0.5);
}

.next-button:hover {
  background-color: #ffffff;
  color: rgba(255, 127, 42, 100);
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
</style>