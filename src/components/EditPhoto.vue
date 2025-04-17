<script setup>
import { ref } from 'vue';
import EditVideo from './EditVideo.vue';
import Replicate from 'replicate';
import { useRoute } from 'vue-router';

const route = useRoute();

const personality = ref(route.params.personality);

const editedImage = ref(null);

const imageUrl = localStorage.getItem("currentImage");


const styles = {
  'ENTP_ENFP': 'https://raw.githubusercontent.com/Riki-Andrian/style_kiosk/main/styles/ENTP_ENFP.jpg',
  'ESFJ_ENFJ': 'https://raw.githubusercontent.com/Riki-Andrian/style_kiosk/main/styles/ESFJ_ENFJ.jpg',
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
      break;
    case "ESFJ":
    case "ENFJ":
      selectedStyle = styles['ESFJ_ENFJ'];
      break;
    case "ESTP":
    case "ESFP":
      selectedStyle = styles['ESTP_ESFP'];
      break;
    case "INFJ":
    case "INFP":
      selectedStyle = styles['INFJ_INFP'];
      break;
    case "INTJ":
    case "INTP":
      selectedStyle = styles['INTJ_INTP'];
      break;
    default:
      selectedStyle = null; // Atau Anda bisa menambahkan style default jika diperlukan
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
    console.log("Image URL:", imageUrl);
    console.log("Selected Style:", selectedStyle);

    const response = await fetch("http://localhost:3001/api/style-transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: imageUrl,
        style_image: selectedStyle
      })
    });


    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }


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
};
// onMounted(() => {
//   chooseStyle(); // Ensure the style is set when the component is mounted
// });

// Jalankan edit otomatis saat halaman dibuka
// onMounted(async () => {
//   await editPhoto();
// });

// // Otomatis trigger video editing begitu image siap
// watch(editedImage, (val) => {
//   if (val && editVideoRef.value) {
//     editVideoRef.value.processVideo();
//   }
// });
</script>

<template>
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