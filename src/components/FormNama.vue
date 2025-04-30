<script setup>
import { ref } from "vue";
import { useRouter } from 'vue-router';

const name = ref("");
const router = useRouter();


const goToNext = () => {
    if (name.value.trim() !== "") {
        router.push("/pertanyaan");
    } else {
        alert("Please enter your name!");
    }
};
const addChar = (char) => {
    name.value += char;
};

const backspace = () => {
    name.value = name.value.slice(0, -1);
};
</script>

<template>
    <div class="app-container">
        <img src="../assets/Background.png" class="background-image" />

        <div class="overlay">
            <div class="top-bar">
                <img src="../assets/Asset Art & Sound.png" class="logo" />
                <img src="../assets/Asset MLD.png" class="logo" />
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
                    <button @click="addChar(' ')" class="keyboard-button space-button">
                        <span class="button-label">Space</span>
                    </button>
                    <button @click="backspace" class="keyboard-button delete-button">
                        <span class="button-label">Delete</span>
                    </button>
                </div>
            </div>

            <button class="next-button" @click="goToNext">Submit</button>
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
    box-sizing: border-box;
    color: white;
    text-align: center;
    align-items: center;
    justify-content: flex-start; 
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
    margin-top: 10%;
    margin-left: auto;
    margin-right: auto;
    width: 80%;  
    max-width: 400px;  
}

.keyboard-row {
    display: flex;
    justify-content: center;
    margin: 5px 0;
}

.keyboard-row button {
    margin: 0 4px;
    height: 42px;
    min-width: 42px;
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
    width: 350px;
}

.delete-button {
    padding: 10px 40px;
    width: 80px;
}

.keyboard-button {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 10px;
  text-align: right;
  vertical-align: bottom;
}

.button-label {
  position: absolute;
  bottom: 4px;
  right: 6px;
  font-size: 0.8rem;
  color: #333;
  font-weight: bold;
}
</style>