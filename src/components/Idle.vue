<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goToHome = () => {
  router.push('/start')
}

onMounted(() => {
  const idleImage = document.querySelector('.idle-image')

  const moveGently = () => {
    const deltaX = (Math.random() - 0.5) * 60 // ±20px
    const deltaY = (Math.random() - 0.5) * 60 // ±20px

    idleImage.style.transform = `translate(${deltaX}px, ${deltaY}px)`
  }

  setInterval(moveGently, 1000) // gerak tiap 1.5 detik
})
</script>

<template>
  <div class="app-container" @click="goToHome">
    <img src="../assets/Background.png" class="background-image" />

    <div class="overlay">
      <div class="top-bar">
        <img src="../assets/art & sound logo.svg" class="logo" />
        <img src="../assets/mld logo.svg" class="logo" />
      </div>

      <div class="center-content">
        <img src="../assets/idle.png" class="idle-image" />
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
  cursor: pointer;
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

.top-bar {
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo {
  width: 80px;
  height: auto;
  margin: 30px;
}

.center-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.idle-image {
  position: relative;
  width: 300px;
  height: auto;
  transition: transform 1.2s ease-in-out;
}
</style>
