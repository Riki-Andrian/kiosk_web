<script setup>
import { ref, computed } from "vue";
import { useRouter } from 'vue-router';

const router = useRouter();

const questions = ref(
    [
        {
            "id": 1,
            "pertanyaan": "CARA LO NIKMATIN MUSIK?",
            "options": [
                { "option": "Sendirian aja", "point": ["I"], "image": new URL('@/assets/pertanyaan/1-1.png', import.meta.url).href },
                { "option": "Bareng close friends", "point": ["I", "E"], "image": new URL('@/assets/pertanyaan/1-2.png', import.meta.url).href },
                { "option": "Di tengah keramaian full of energy", "point": ["E"], "image": new URL('@/assets/pertanyaan/1-3.png', import.meta.url).href },
                { "option": "Live concerts, loud and wild!", "point": ["E"], "image": new URL('@/assets/pertanyaan/1-4.png', import.meta.url).href }
            ]
        },
        {
            "id": 2,
            "pertanyaan": "LAGU KEREN BUAT LO?",
            "options": [
                { "option": "Complex melody & deep details", "point": ["T"], "image": new URL('@/assets/pertanyaan/2-1.png', import.meta.url).href },
                { "option": "Lirik & emosi yang deep banget", "point": ["F"], "image": new URL('@/assets/pertanyaan/2-2.png', import.meta.url).href },
                { "option": "Groove & rhythm that makes me move", "point": ["S", "E"], "image": new URL('@/assets/pertanyaan/2-3.png', import.meta.url).href },
                { "option": "Unpredictable beat & wild creativity", "point": ["P", "E"], "image": new URL('@/assets/pertanyaan/2-4.png', import.meta.url).href }
            ]
        },
        {
            "id": 3,
            "pertanyaan": "ARTI MUSIK BUAT LO?",
            "options": [
                { "option": "Helps me think & feel deeply", "point": ["I", "T"], "image": new URL('@/assets/pertanyaan/3-1.png', import.meta.url).href },
                { "option": "Connects with my feelings & memories", "point": ["I", "F"], "image": new URL('@/assets/pertanyaan/3-2.png', import.meta.url).href },
                { "option": "Bikin gw semangat & siap menghadapi hari", "point": ["E"], "image": new URL('@/assets/pertanyaan/3-3.png', import.meta.url).href },
                { "option": "Kebebasan berekspresi & high energy", "point": ["E", "P"], "image": new URL('@/assets/pertanyaan/3-4.png', import.meta.url).href }
            ]
        },
        {
            "id": 4,
            "pertanyaan": "KALO LU MUSISI, LO ADALAH..?",
            "options": [
                { "option": "Composer, crafting every sound with precision", "point": ["I", "T"], "image": new URL('@/assets/pertanyaan/4-1.png', import.meta.url).href },
                { "option": "Songwriter, express deep emotions with my song", "point": ["I", "F"], "image": new URL('@/assets/pertanyaan/4-2.png', import.meta.url).href },
                { "option": "Drummer, selalu bring up the energy", "point": ["E", "F"], "image": new URL('@/assets/pertanyaan/4-3.png', import.meta.url).href },
                { "option": "Vokalis utama, owning the stage & hyping up the crowd", "point": ["E", "P"], "image": new URL('@/assets/pertanyaan/4-4.png', import.meta.url).href }
            ]
        },
        {
            "id": 5,
            "pertanyaan": "PAS ADA LAGU BARU YANG LO SUKA, LO AKAN..?",
            "options": [
                { "option": "Analisa dulu lirik, melodi dan aransemennya", "point": ["I", "T"], "image": new URL('@/assets/pertanyaan/5-1.png', import.meta.url).href },
                { "option": "Add to playlist & play it on repeat", "point": ["I", "F"], "image": new URL('@/assets/pertanyaan/5-2.png', import.meta.url).href },
                { "option": "Share ke teman & talk about it", "point": ["E", "F"], "image": new URL('@/assets/pertanyaan/5-3.png', import.meta.url).href },
                { "option": "Remix it & sing along loud!", "point": ["E", "P"], "image": new URL('@/assets/pertanyaan/5-4.png', import.meta.url).href }
            ]
        }
    ]
);

const answers = ref([]);
const currentQuestionIndex = ref(0);
const currentAnswer = ref(null);
const currentPoints = ref([]);
const points = ref({
    "I": 0,
    "E": 0,
    "T": 0,
    "F": 0,
    "S": 0,
    "N": 0,
    "J": 0,
    "P": 0
});

// Fungsi tombol "Next"
const goToNext = () => {
    if (currentQuestionIndex.value < questions.value.length - 1) {
        currentQuestionIndex.value++;
        currentAnswer.value = answers.value[currentQuestionIndex.value] ?? null;
    } else {
        console.log("Quiz selesai");
        const rating = rateAnswers();
        console.log(rating);
        router.push(`/cameratest/${rating}`);
    }
}

const goToPrevious = () => {
    if (currentQuestionIndex.value > 0) {
        currentQuestionIndex.value--;
        currentAnswer.value = answers.value[currentQuestionIndex.value] ?? null;
    }
}

const pickAnswer = (optionIndex) => {
    currentAnswer.value = optionIndex;

    answers.value[currentQuestionIndex.value] = optionIndex;

    const selected = currentQuestion.value.options[optionIndex].point;
    currentPoints.value[currentQuestionIndex.value] = selected;
}


const rateAnswers = () => {
    // Reset point sebelum hitung ulang
    for (let key in points.value) {
        points.value[key] = 0;
    }

    currentPoints.value.forEach((point) => {
        point?.forEach((p) => {
            points.value[p]++;
        });
    });

    let result = [];
    result.push(points.value["I"] > points.value["E"] ? "I" : "E");
    result.push(points.value["S"] > points.value["N"] ? "S" : "N");
    result.push(points.value["T"] > points.value["F"] ? "T" : "F");
    result.push(points.value["P"] > points.value["J"] ? "P" : "J");

    return result.join('');
}


const currentQuestion = computed(() => questions.value[currentQuestionIndex.value]);
</script>

<template>
    <div class="app-container">
        <img src="../assets/normal-bg.png" class="background-image" />

        <div class="overlay">
            <div class="top-bar">
                <img src="../assets/mld-logo.png" class="logo" />
                <img src="../assets/art-n-sound.png" class="logo" />
            </div>

            <div class="title-text" v-if="currentQuestion">
                <p class="question">{{ questions[currentQuestionIndex].pertanyaan }}</p>
            </div>

            <div class="options-grid" v-if="currentQuestion">
                <button class="option-button" :class="{ active: idx === currentAnswer }"
                    v-for="(opt, idx) in currentQuestion.options" :key="idx" @click="pickAnswer(idx)">
                    <img :src="opt.image" class="logo" />
                    {{ opt.option }}
                </button>
            </div>
            <!-- <button class="next-button" @click="goToNext">Next</button> -->
            <div class="navigation-buttons">
                <button class="next-button" @click="goToPrevious" :disabled="currentQuestionIndex === 0">B A C K</button>
                <button class="next-button" @click="goToNext" :disabled="currentAnswer === null">N E X T</button>
            </div>
            <div class="progress-bar-container">
                <div v-for="(q, i) in questions" :key="i" class="progress-segment" :class="{
                    filled: i < currentQuestionIndex,
                    current: i === currentQuestionIndex
                }"></div>
            </div>
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

.overlay {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 16px;
    box-sizing: border-box;
    color: white;
    text-align: center;
    justify-content: space-between;
}

.top-bar {
    display: flex;
    justify-content: center;
    align-items: center;

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

.title-text {
    margin-top: 4px;
}

.title-text h1 {
    font-size: 1.5rem;
    margin: 0;
    font-weight: lighter;
}

.question {
    margin: 8px 0;
    font-size: 2rem;
    font-weight: bold;
    text-transform: uppercase;
    font-family: 'Montserrat-ExtraBold';
    color: #B32024;

    animation: buttonAppear 1.5s ease-out forwards;
    transform-origin: center;
    filter: blur(8px);
    opacity: 0;
    transform: scale(0.5);
}

.options-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 0 5%;
    box-sizing: border-box;

    animation: buttonAppear 1.5s ease-out forwards;
    transform-origin: center;
    filter: blur(8px);
    opacity: 0;
    transform: scale(0.5);
}

.option-button {
    aspect-ratio: 1/1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px;
    background-color: rgba(255, 255, 255, 0.9);
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: bold;
    font-family: 'Montserrat-Bold';
    cursor: pointer;
    color: #333;
    transition: transform 0.2s, background-color 0.2s;
}

.option-button img {
    margin-top: 5%;
    width: 100px;
    height: 100px;
    object-fit: contain;
}

.option-button:hover {
    background-color: rgba(255, 127, 42, 100);
    color: #fff;
}

.option-button.active {
    background-color: #B32024;
    color: #fff;
}

.navigation-buttons {
    display: flex;
    justify-content: space-around;

    animation: buttonAppear 1.5s ease-out forwards;
    transform-origin: center;
    filter: blur(8px);
    opacity: 0;
    transform: scale(0.5);
}
.next-button {
    margin-top: 1%;
    background-color: #f66200;
    border: none;
    padding: 12px 48px;
    border-radius: 24px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    color: #ffffff;
    transition: background-color 0.2s, transform 0.2s;
    align-self: center;
}

.next-button:hover {
    background-color: #ffffff;
    color: rgba(255, 127, 42, 100);
}

.next-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.progress-bar-container {
    display: flex;
    justify-content: center;
    gap: 6px;
    padding: 0 20px;
    width: 100%;
    max-width: 500px;
    box-sizing: border-box;
    padding-bottom: 5%;
}

.progress-segment {
    flex: 1;
    height: 6px;
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    transition: background-color 0.3s ease, width 0.3s ease;
}

.progress-segment.filled {
    background-color: #ff7f2a;
}

.progress-segment.current {
    background-color: rgba(255, 127, 42, 0.8);
}
</style>