<script setup>
import { ref } from 'vue';
import EditVideo from './EditVideo.vue';
import Replicate from 'replicate';
import { useRoute } from 'vue-router';

const route = useRoute();

const personality = ref(route.params.personality);

const editedImage = ref(null);

const imageUrl = localStorage.getItem("currentImage");

// const textContent = "Make it seems like it's underwater";
const textContent = "Make the current picture looks like it's underwater";

const editPhoto = async () => {
  try {
    const formData = new FormData();
    console.log("editing...");
    formData.append('image', imageUrl);
    formData.append('text', textContent);

    const response = await fetch("http://localhost:3001/api/style-transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: imageUrl,
        textContent: textContent
      })
    });

    const data = await response.json();
    if (data.success) {
      console.log(data.images);
      const response = await fetch(data.images);
      const blob = await response.blob();
      editedImage.value = URL.createObjectURL(blob);
    } else {
      console.error('Error applying style transfer:', data.error);
    }
  } catch (error) {
    console.error("Error editing photo:", error);
  }
}

</script>

<template>
  <!-- <div>
    <h2>Edit Image</h2>
    <img :src="editedImage" alt="Captured" v-if="editedImage" />
    <button @click="editPhoto">Edit</button>
  </div>
  <div v-if="editedImage">
    <h2>Generate Video</h2>
    <EditVideo :overlay-image="editedImage" />
  </div> -->

  <div class="app-container">
    <img src="../assets/Background.png" class="background-image" />

    <div class="overlay">
      <div class="top-bar">
        <img src="../assets/art & sound logo.svg" class="logo" />
        <img src="../assets/mld logo.svg" class="logo" />
      </div>
      <div>
        <h2>Edit Image</h2>
        <img :src="editedImage" alt="Captured" v-if="editedImage" />
        <button @click="editPhoto">Edit</button>
      </div>
      <div v-if="editedImage">
        <h2>Generate Video</h2>
        <EditVideo :overlay-image="editedImage" :personality="personality" />
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
</style>