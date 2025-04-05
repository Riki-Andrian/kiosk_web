<script setup>
  import { ref, onMounted } from "vue";
  import { useRouter } from 'vue-router';
  import PreviewPicture from "./PreviewPicture.vue";

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
  
  const router = useRouter();

  const editPhoto = () => {
    localStorage.setItem("currentImage", capturedImage.value);

    router.push({ path: '/edit'});
  };

</script>

<template>
  <div v-if="!capturedImage">
    <video ref="cameraStream" autoplay></video>
    <button @click="capturePhoto">Capture</button>
  </div>
  <div v-else>
    <PreviewPicture :image="capturedImage" />
    <button @click="retakePhoto">Take another picture</button>
    <button @click="editPhoto">Edit</button>
  </div>
</template>
