<script setup>
import { ref } from "vue";
import { useRouter } from 'vue-router';

const name = ref("");
const router = useRouter();

const goToNext = (event) => {
    if (event) event.preventDefault();

    if (name.value.trim() !== "") {
        const selectors = [
            '.top-bar',
            '.enter-name',
            '.name-input',
            '.next-button',
            '.keyboard'
        ];

        const elementsToAnimate = selectors.flatMap(selector =>
            Array.from(document.querySelectorAll(selector))
        );

        elementsToAnimate.forEach(el => {
            el.classList.add('disappear'); // 🧼 class-based approach
        });

        setTimeout(() => {
            router.push("/pertanyaan");
        }, 1000);
    } else {
    const popup = document.getElementById('popup');
    popup.classList.remove('hidden');
    popup.classList.remove('hide');
    popup.classList.add('show');

    setTimeout(() => {
        popup.classList.remove('show');
        popup.classList.add('hide');

        // Hide the popup completely after animation
        setTimeout(() => {
            popup.classList.add('hidden');
        }, 500); // match buttonDisappear duration
    }, 2000);
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
        <img src="../assets/normal-bg.png" class="background-image" />

        <div class="overlay">
            <div class="top-bar">
                <img src="../assets/mld-logo.png" class="logo" />
                <img src="../assets/art-n-sound.png" class="logo" />
            </div>

            <div class="title-text">
                <h1 class="enter-name">Enter Your Name</h1>
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
            <button class="next-button" @click="goToNext">S U B M I T</button>
            <div id="popup" class="popup hidden">Please enter your name!</div>
        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');

*{
    font-family: 'Montserrat', sans-serif;
}
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
.enter-name {
    font-family: 'Montserrat', sans-serif;
    font-size: 0.5rem;
    color: #B32024;
    margin-top: 20px;
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

.popup {
    position: absolute;
    bottom: 20px;
    left: 45%;
    transform: translateX(-50%);
    background-color: #B32024;
    color: white;
    padding: 1rem 2rem;
    border-radius: 1rem;
    font-size: 1rem;
    font-weight: bold;
    z-index: 999;
    opacity: 0;
    transform: scale(0.7);
    filter: blur(6px);
    pointer-events: none;
}

.popup.show {
    animation: buttonAppear 0.5s ease-out forwards;
}

.popup.hide {
    animation: buttonDisappear 0.5s ease-in forwards;
}

.hidden {
    display: none;
}


.top-bar {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20%;

    /* Animation properties */
    animation: buttonAppear 1.5s ease-out forwards;
    transform-origin: center;
    filter: blur(8px);
    opacity: 0;
    transform: scale(0.5);
}

.logo {
    width: 20%;
    height: auto;
    margin: 10px;
}

.title-text {
    font-size: 1rem;
    width: 75%;
}

.title-text h1 {
    font-size: 1.5rem;
    margin: 0;
    font-weight: bold;
    text-transform: uppercase;

    /* Animation properties */
    animation: buttonAppear 1.5s ease-out forwards;
    transform-origin: center;
    filter: blur(8px);
    opacity: 0;
    transform: scale(0.5);
}

.name-input {
    margin-top: 10%;
    padding: 5%;
    background-color: white;
    border: none;
    border-radius: 1rem;
    box-shadow: 0 0 10px 5px rgba(255, 255, 255, 0.7);
    color: #B32024;
    font-size: 2.5rem;
    text-align: center;
    outline: none;
    width: 100%;
    height: 60%;
    font-weight: bold;

    /* Animation properties */
    animation: buttonAppear 1.5s ease-out forwards;
    transform-origin: center;
    filter: blur(8px);
    opacity: 0;
    transform: scale(0.5);
}

.name-input::placeholder {
    color: rgba(255, 255, 255, 0.6);
}

.next-button {
    margin-top: 10%;
    background-color: #f66200;
    border: none;
    padding: 14px 50px;
    width: 250px;
    height: 60px;
    border-radius: 30px;
    font-size: 1.6rem;
    font-weight: bold;
    cursor: pointer;
    color: #ffffff;
    z-index: 2;
    font-weight: 600;
    
    /* Animation properties */
    animation: buttonAppear 1.5s ease-out forwards;
    transform-origin: center;
    filter: blur(8px);
    opacity: 0;
    transform: scale(0.5);
}

.disappear {
  animation: buttonDisappear 1s ease-out forwards !important;
}


/* Keyframes for the button animation */
@keyframes buttonAppear {
    0% {
        transform: scale(0.5);
        filter: blur(8px);
        opacity: 0;
    }
    70% {
        transform: scale(1.05);
        filter: blur(2px);
        opacity: 0.8;
    }
    100% {
        transform: scale(1);
        filter: blur(0);
        opacity: 1;
    }
}

@keyframes buttonDisappear {
    0% {
        transform: scale(1);
        filter: blur(0px);
        opacity: 1;
    }
    100% {
        transform: scale(0.7); /* or go smaller if you want */
        filter: blur(6px);
        opacity: 0;
    }
}

.next-button:hover {
    background-color: #d35400;
    color: #ffffff;
}

.keyboard {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 10%;
    margin-left: auto;
    margin-right: auto;
    width: 100%;

    /* Animation properties */
    animation: buttonAppear 1.5s ease-out forwards;
    transform-origin: center;
    filter: blur(8px);
    opacity: 0;
    transform: scale(0.5);
}

.keyboard-row {
    display: flex;
    justify-content: center;
    margin: 1% 0;
}

.keyboard-row button {
    margin: 0 4px;
    height: 50px;
    min-width: 42px;
    font-size: 1.5rem;
    border: none;
    border-radius: 6px;
    background-color: #ffffff;
    color: #B32024;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.2s;
    text-align: center;
    font-weight: 500;
}

.keyboard-row button:hover {
    background-color: #fff;
}

.space-button {
    padding: 10px 60px;
    width: 350px;
    background-color: #ffffff;
    color: #B32024;
}

.delete-button {
    padding: 10px 40px;
    width: 80px;
    background-color: #ffffff;
    color: #B32024;
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
  background-color: #ffffff;
  color: #B32024;
  font-weight: bold;
}
</style>