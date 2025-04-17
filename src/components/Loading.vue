<script setup>
import { onMounted, ref } from 'vue';
import lottie from 'lottie-web';
import { useRouter } from 'vue-router';
import loadingAnimation from '@/assets/loading.json?url';

const router = useRouter(); // Menambahkan router
const lottieContainer = ref(null);

onMounted(() => {
    lottie.loadAnimation({
        container: lottieContainer.value,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: loadingAnimation,
    });
});
</script>

<template>
    <div class="app-container">
        <img src="../assets/Background.png" class="background-image" />

        <div class="overlay">
            <div class="top-bar">
                <img src="../assets/art & sound logo.svg" class="logo" />
                <img src="../assets/mld logo.svg" class="logo" />
            </div>

            <div class="lottie-wrapper">
                <div class="lottie-container" ref="lottieContainer"></div>
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

.lottie-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;  /* Pastikan wrapper mengambil tinggi penuh */
    width: 100%;    /* Ambil lebar penuh agar animasi bisa berada di tengah */
}

.lottie-container {
    width: 400px;  /* Sesuaikan dengan ukuran yang diinginkan */
    height: 400px; /* Sesuaikan dengan ukuran yang diinginkan */
}
</style>