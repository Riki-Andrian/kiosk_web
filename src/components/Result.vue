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
    <img src="../assets/Background.png" class="background-image" />

    <div class="overlay">
      <div class="title-text">
        <h1>Video Result</h1>
        <video v-if="videoUrl" :src="videoUrl" controls class="responsive-video" />
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
  font-size: 2rem;
  margin: 0;
  font-weight: bold;
  text-transform: uppercase;
}

.result-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
}

.responsive-video {
  max-width: 90vw;
  max-height: 70vh;
  width: auto;
  height: auto;
  border-radius: 10px;
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
  width: 100px;
  height: 100px;
  border-radius: 8px;
}

.qr-text {
  font-size: 1.5rem;
  line-height: 1.2;
  color: white;
  text-align: left;
  font-weight: bold;
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
}

.next-button:hover {
  background-color: #ffffff;
  color: rgba(255, 127, 42, 100);
}
</style>