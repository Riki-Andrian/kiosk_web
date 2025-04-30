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
        currentAnswer.value = null;
    } else {
        // Nanti bisa arahkan ke hasil/halaman lain
        console.log("Quiz selesai");

        const rating = rateAnswers();

        console.log(rating);
        // router.push("/result"); // Contoh jika mau redirect
        router.push(`/cameratest/${rating}`);
    }
}

const pickAnswer = (optionIndex) => {
    currentAnswer.value = optionIndex;

    currentPoints.value[currentQuestionIndex.value] = (currentQuestion.value.options[currentAnswer.value].point);
}

const rateAnswers = () => {
    currentPoints.value.forEach((point) => {
        point.forEach((p) => {
            points.value[p]++;
        });
    });

    let result = [];

    result.push(points.value["I"] > points.value["E"] ? "I" : "E");
    result.push(points.value["S"] > points.value["N"] ? "S" : "N");
    result.push(points.value["T"] > points.value["F"] ? "T" : "F");
    result.push(points.value["P"] > points.value["J"] ? "P" : "J");

    result = result.join('');

    return result;
}

const currentQuestion = computed(() => questions.value[currentQuestionIndex.value]);
</script>

<template>
    <div class="app-container">
        <img src="../assets/Background.png" class="background-image" />

        <div class="overlay">
            <div class="top-bar">
                <img src="../assets/Asset Art & Sound.png" class="logo" />
                <img src="../assets/Asset MLD.png" class="logo" />
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
            <button class="next-button" @click="goToNext">Next</button>
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
    justify-content: space-between;
    align-items: center;
}

.logo {
    width: 80px;
    height: auto;
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
    font-size: 1.5rem;
    font-weight: bold;
    text-transform: uppercase;
}

.options-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 0 28px;
    box-sizing: border-box;
}

.option-img {
    width: 80px;
    height: auto;
}

.option-button {
    aspect-ratio: 3/2;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px;
    background-color: rgba(255, 255, 255, 0.9);
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    color: #333;
    transition: transform 0.2s, background-color 0.2s;
}

.option-button img {
    width: 120px;
    height: 150px;
    object-fit: contain;
    margin-bottom: 8px;
}

.option-button:hover {
    background-color: rgba(255, 127, 42, 100);
    color: #fff;
}

.option-button.active {
    background-color: rgba(255, 127, 42, 100);
    color: #fff;
}

.next-button {
    margin-top: 20px;
    background-color: rgba(255, 127, 42, 1);
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

.progress-bar-container {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin: 16px auto 0;
    padding: 0 20px;
    width: 100%;
    max-width: 500px;
    box-sizing: border-box;
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