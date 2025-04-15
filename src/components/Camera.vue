<script setup>
  import { ref, onMounted } from "vue";
  import { useRouter, useRoute } from 'vue-router';
  import PreviewPicture from "./PreviewPicture.vue";

  const router = useRouter();
  const route = useRoute();

  const cameraStream = ref(null);
  const capturedImage = ref(null);

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

    setTimeout(() => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = cameraStream.value.videoWidth;
      canvas.height = cameraStream.value.videoHeight;

      ctx.drawImage(cameraStream.value, 0, 0, canvas.width, canvas.height);

      capturedImage.value = canvas.toDataURL("image/png");
    }, 500);
  };

  const retakePhoto = () => {
    capturedImage.value = null;
    loadCameraStream();
  }

  const editPhoto = () => {
    localStorage.setItem("currentImage", capturedImage.value);

    router.push({ path: `/edit/${route.params.personality}` });
  };

</script>

<!-- <template>
  <div v-if="!capturedImage">
    <video ref="cameraStream" autoplay></video>
    <button @click="capturePhoto">Capture</button>
  </div>
  <div v-else>
    <PreviewPicture :image="capturedImage" />
    <button @click="retakePhoto">Take another picture</button>
    <button @click="editPhoto">Edit</button>
  </div>
</template> -->

<template>
  <div class="app-container">
    <img src="../assets/Background.png" class="background-image" />

    <div class="overlay">
      <div class="top-bar">
        <img src="../assets/art & sound logo.svg" class="logo" />
        <img src="../assets/mld logo.svg" class="logo" />
      </div>

      <div class="title-text">
        <h1>GET YOUR ALBUM COVER.</h1>
        <h2>STRIKE A POSE!</h2>
      </div>

      <div v-if="!capturedImage" class="camera-container">
        <video ref="cameraStream" autoplay></video>
        <button class="action-button" @click="capturePhoto">Take a Photo</button>
      </div>

      <div v-else class="preview-container">
        <PreviewPicture :image="capturedImage" />
        <button class="action-button" @click="retakePhoto">Take another picture</button>
        <button class="action-button" @click="editPhoto">Edit</button>
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

.camera-container,
.preview-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

video {
  width: 80%;
  max-width: 400px;
  border-radius: 12px;
  margin: 20px 0;
}

.action-button {
  background-color: #ffffffcc;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  margin: 10px;
}
</style>

