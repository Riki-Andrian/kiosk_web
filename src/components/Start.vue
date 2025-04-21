<script setup>
import { ref } from "vue";
import { useRouter } from 'vue-router';


const router = useRouter();

// Fungsi untuk mengarahkan ke halaman "/pertanyaan"
const goToNext = () => {
    router.push("/form"); // Navigasi ke halaman pertanyaan
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
                <h1>Your Music Personality</h1>
                <button class="next-button" @click="goToNext">Next</button>
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

.next-button {
    margin-top: 20px;
    background-color: rgba(255, 127, 42, 100);
    border: none;
    padding: 14px 48px;
    border-radius: 24px;
    font-size: 1.3rem;
    font-weight: bold;
    cursor: pointer;
    color: #ffffff;
    z-index: 2;
    transition: background-color 0.2s, transform 0.2s;
}

.next-button:hover {
    background-color: #ffffff;
    color: rgba(255, 127, 42, 100);;
    transform: scale(1.05);
}
</style>