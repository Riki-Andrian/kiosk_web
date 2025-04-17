<script setup>
import { ref } from "vue";
import { useRouter } from 'vue-router';

const router = useRouter(); // Menambahkan router

// Fungsi untuk mengarahkan ke halaman "/mulai"
const goToNext = () => {
        router.push("/pertanyaan"); // Navigasi ke halaman pertanyaan
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

</style>