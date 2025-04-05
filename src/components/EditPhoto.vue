<script setup>
import { ref } from 'vue';
import EditVideo from './EditVideo.vue';

const editedImage = ref(null);

const imageUrl = localStorage.getItem("currentImage");

const textContent = "Make it seems like it's underwater";

const editPhoto = async () => {
    try {
      const formData = new FormData();
      console.log("editing...");
      formData.append('image', imageUrl);
      formData.append('text', textContent);

      const resp = await fetch('https://api.deepai.org/api/image-editor', {
        method: 'POST',
        headers: {
          'api-key': import.meta.env.VITE_DEEP_AI_KEY,
        },
        body: formData
      });

      const data = await resp.json();
      if (data) {
        const response = await fetch(data.output_url);
        const overlayBlob = await response.blob();
        editedImage.value = URL.createObjectURL(overlayBlob);
      }
    } catch (error) {
      console.error("Error editing photo:", error);
  }
}

</script>

<template>
  <div>
    <h2>Edit Image</h2>
    <img :src="editedImage" alt="Captured" v-if="editedImage" />
    <button @click="editPhoto">Edit</button>
  </div>
  <div v-if="editedImage">
    <h2>Generate Video</h2>
    <EditVideo :overlay-image="editedImage" />
  </div>
</template>
