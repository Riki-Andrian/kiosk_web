<script setup>
import { ref, computed  } from "vue";
import { useRouter } from 'vue-router';

const questions = ref(
    [
        {
            "id": 1,
            "pertanyaan": "HOW DO YOU LISTEN TO MUSIC",
            "options": [
                { "option": "Alone", "point": ["I"] },
                { "option": "With close friend", "point": ["I", "E"] },
                { "option": "With large crowd", "point": ["E"] },
                { "option": "Live concerts loud and wild", "point": ["E"] }
            ]
        },
        {
            "id": 2,
            "pertanyaan": "WHAT MAKES A SONG GREAT FOR YOU?",
            "options": [
                { "option": "Smooth, precise melodies", "point": ["T"] },
                { "option": "Emotional lyrics", "point": ["F"] },
                { "option": "Groove & rhythm", "point": ["S", "E"] },
                { "option": "Unpredictable, free-folowing sound", "point": ["P", "E"] }
            ]
        },
        {
            "id": 3,
            "pertanyaan": "IF YOU WERE IN A JAZZ BAND, YOU'D BE...",
            "options": [
                { "option": "Pianist", "point": ["I", "T"] },
                { "option": "Saxophonist", "point": ["I", "F"] },
                { "option": "Drummer", "point": ["E"] },
                { "option": "Singer", "point": ["E", "P"] }
            ]
        },
        {
            "id": 4,
            "pertanyaan": "WHAT'S YOUR IDEAL CROOVE NIGHT?",
            "options": [
                { "option": "Chill lounge", "point": ["I", "T"] },
                { "option": "Soulfull jam session", "point": ["I", "F"] },
                { "option": "Big band swing", "point": ["E", "F"] },
                { "option": "Underground club", "point": ["E", "P"] }
            ]
        },
        {
            "id": 5,
            "pertanyaan": "WHICH JAZZ STYLE FITS YOU BEST?",
            "options": [
                { "option": "Cool jazz", "point": ["I", "T"] },
                { "option": "Soul jazz", "point": ["I", "F"] },
                { "option": "big band swing", "point": ["E", "F"] },
                { "option": "Free jazz", "point": ["E", "P"] }
            ]
        }
    ]
);
const currentQuestionIndex = ref(0);

// Fungsi tombol "Next"
function goToNext() {
    if (currentQuestionIndex.value < questions.value.length - 1) {
        currentQuestionIndex.value++;
    } else {
        // Nanti bisa arahkan ke hasil/halaman lain
        console.log("Quiz selesai");
        // router.push("/result"); // Contoh jika mau redirect
    }
}
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value]);
</script>

<template>
    <div class="app-container">
        <img src="../assets/Background.png" class="background-image" />

        <div class="overlay">
            <div class="top-bar">
                <img src="../assets/art & sound logo.svg" class="logo" />
                <img src="../assets/mld logo.svg" class="logo" />
            </div>

            <div class="title-text" v-if="currentQuestion">
                <h1>WHICH ONE DESCRIBE YOU THE MOST?</h1>
                <p class="question">{{ questions[currentQuestionIndex].pertanyaan }}</p>
            </div>

            <div class="options-grid" v-if="currentQuestion">
                <button class="option-button" v-for="(opt, idx) in currentQuestion.options"
                :key="idx">
                    <img src="../assets/art & sound logo.svg" class="logo" />
                    {{ opt.option }}
                </button>
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
    font-size: 1.5rem;
    margin: 0;
    font-weight: lighter;
}


.question {
    margin: 16px 0;
    font-size: 2.5rem;
    font-weight: bold;
    text-transform: uppercase;
}

.options-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-top: 20px;
    margin-left: 100px;
    margin-right: 100px;
    padding: 0 20px;
}

.option-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px;
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
    width: 60px;
    height: 60px;
    object-fit: contain;
    margin-bottom: 8px;
}

.option-button:hover {
    background-color: rgba(255, 127, 42, 100);
    color: #fff;
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