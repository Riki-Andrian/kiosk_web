<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();
const videoUrl = route.query.videoUrl;
</script>


<template>
  <div class="app-container">
    <img src="../assets/Background.png" class="background-image" />

    <div class="overlay">
      <div class="title-text">
        <h1>Video Result</h1>
        <video v-if="videoUrl" :src="videoUrl" controls class="responsive-video" />
        <p v-else>Video URL not found.</p>
        <div v-if="videoUrl" class="qr-container">
          <img src="../assets/qr.png" alt="QR Code" class="qr-code" />
          <p class="qr-text">Scan to<br>Download</p>
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
  gap: 1rem; /* jarak antara gambar dan teks */
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
</style>