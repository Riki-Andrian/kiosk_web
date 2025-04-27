<script setup>
import { ref } from "vue";
import { useRouter } from 'vue-router';

const name = ref("");
const router = useRouter(); // Menambahkan router

// Fungsi untuk mengarahkan ke halaman "/pertanyaan"
const goToNext = () => {
    if (name.value.trim() !== "") {
        router.push("/pertanyaan"); // Navigasi ke halaman pertanyaan
    } else {
        alert("Please enter your name!"); // Alert jika nama belum diisi
    }
};
// Fungsi untuk menambahkan karakter ke input
const addChar = (char) => {
    name.value += char;
};

// Fungsi untuk menghapus karakter terakhir
const backspace = () => {
    name.value = name.value.slice(0, -1);
};
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

            <div class="keyboard">
                <div class="keyboard-row">
                    <button v-for="key in 'QWERTYUIOP'.split('')" :key="key" @click="addChar(key)">{{ key }}</button>
                </div>
                <div class="keyboard-row">
                    <button v-for="key in 'ASDFGHJKL'.split('')" :key="key" @click="addChar(key)">{{ key }}</button>
                </div>
                <div class="keyboard-row">
                    <button v-for="key in 'ZXCVBNM'.split('')" :key="key" @click="addChar(key)">{{ key }}</button>
                </div>
                <div class="keyboard-row">
                    <button @click="addChar(' ')" class="space-button">Space</button>
                    <button @click="backspace">delete</button>
                </div>
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
    justify-content: center;
    align-items: center;
}

.logo {
    width: 80px;
    height: auto;
    margin: 30px;
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
    background-color: rgba(255, 127, 42, 100);
    border: none;
    padding: 14px 48px;
    border-radius: 28px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    color: #fff;
    z-index: 2;
    transition: background-color 0.2s, transform 0.2s;
}

.next-button:hover {
    background-color: #ffffff;
    color: rgba(255, 127, 42, 100);
    transform: translateX(-50%) scale(1.05);
}
.keyboard {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 30px;
}

.keyboard-row {
  display: flex;
  justify-content: center;
  margin: 5px 0;
}

.keyboard-row button {
  margin: 0 4px;
  padding: 10px 14px;
  font-size: 1.2rem;
  border: none;
  border-radius: 6px;
  background-color: #ffffffcc;
  color: #333;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.keyboard-row button:hover {
  background-color: #fff;
}

.space-button {
  padding: 10px 60px;
  width: 300px;
}
</style>