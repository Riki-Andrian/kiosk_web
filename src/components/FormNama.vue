<script setup>
import { ref } from "vue";
import { useRouter } from 'vue-router';

const name = ref("");
</script>

<template>
    <div class="app-container">
        <img src="../assets/Background.png" class="background-image" />

        <div class="overlay">
            <div class="top-bar">
                <img src="../assets/art & sound logo.svg" class="logo" />
                <img src="../assets/mld logo.svg" class="logo" />
            </div>

            <div class="title-text">
                <h1>Enter Your Name</h1>
                <input v-model="name" type="text" placeholder="Type your name here" class="name-input" />
            </div>

            <button class="next-button" @click="goToNext">Next</button>
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

.title-text h1 {
    font-size: 2rem;
    margin: 0;
    font-weight: bold;
    text-transform: uppercase;
}

.name-input {
  margin-top: 50px;
  padding: 10px;
  background: transparent;
  border: none;
  border-bottom: 2px solid white;
  color: white;
  font-size: 1.2rem;
  text-align: center;
  outline: none;
  width: 80%;
  max-width: 300px;
  align-self: center;
}

.name-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.next-button {
    position: fixed;
    bottom: 50px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #ffffffcc;
    border: none;
    padding: 14px 28px;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    color: #333;
    z-index: 2;
    transition: background-color 0.2s, transform 0.2s;
}

.next-button:hover {
    background-color: #ffffff;
    transform: translateX(-50%) scale(1.05);
}
</style>