<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import lottie from "lottie-web";

const router = useRouter();

// References for the Lottie containers
const lottieContainer = ref(null);
const secondLottieContainer = ref(null); // New reference for the second Lottie animation
let lottieInstance = null;
let secondLottieInstance = null; // New instance for the second Lottie animation

// Function to navigate to the next page after playing the "start-out" animation
const goToNext = async () => {
    try {
        if(lottieInstance) {
            lottieInstance.destroy(); // Destroy the first animation instance
        }

        const outResponse = await fetch(new URL('@/assets/lottie/start-page/start-out.json', import.meta.url));
        const outAnimationData = await outResponse.json();

        lottieInstance = lottie.loadAnimation({
            container: lottieContainer.value,
            renderer: "svg",
            loop: false, // Do not loop the out animation
            autoplay: true,
            animationData: outAnimationData,
        });

        // Destroy the current "music-idle.json" animation
        if (secondLottieInstance) {
            secondLottieInstance.destroy();
        }

        // Load and play the "music-out.json" animation
        const outSecondResponse = await fetch(new URL('@/assets/lottie/start-page/music-out.json', import.meta.url));
        const outSecondAnimationData = await outSecondResponse.json();

        secondLottieInstance = lottie.loadAnimation({
            container: secondLottieContainer.value,
            renderer: "svg",
            loop: false, // Do not loop the out animation
            autoplay: true,
            animationData: outSecondAnimationData,
        });

        // Optionally, navigate to the next page after "music-out.json" completes
        lottieInstance.addEventListener("complete", () => {
            router.push("/form"); // Navigate to the next page
        });
    } catch (error) {
        console.error("Error switching animations in 'goToNext':", error);
    }
};

// Initialize the "start-in" and second Lottie animations
onMounted(async () => {
    try {
        // Load the first Lottie animation
        const response = await fetch(new URL('@/assets/lottie/start-page/start-in.json', import.meta.url));
        const animationData = await response.json();

        lottieInstance = lottie.loadAnimation({
            container: lottieContainer.value,
            renderer: "svg",
            loop: false,
            autoplay: true,
            animationData,
        });

        // Load the second Lottie animation
        const secondResponse = await fetch(new URL('@/assets/lottie/start-page/music-in.json', import.meta.url));
        const secondAnimationData = await secondResponse.json();

        secondLottieInstance = lottie.loadAnimation({
            container: secondLottieContainer.value,
            renderer: "svg",
            loop: false, // Do not loop the second animation
            autoplay: true,
            animationData: secondAnimationData,
        });

        // Wait for the second animation to complete
        secondLottieInstance.addEventListener("complete", async () => {
            // Load and play the "music-idle.json" animation
            const idleResponse = await fetch(new URL('@/assets/lottie/start-page/music-idle.json', import.meta.url));
            const idleAnimationData = await idleResponse.json();

            secondLottieInstance.destroy(); // Destroy the second animation
            secondLottieInstance = lottie.loadAnimation({
                container: secondLottieContainer.value,
                renderer: "svg",
                loop: true, // Set to true to keep it looping
                autoplay: true,
                animationData: idleAnimationData,
            });
        });
    } catch (error) {
        console.error("Error loading Lottie animations:", error);
    }
});
</script>

<template>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <div class="app-container" @contextmenu.prevent>
        <img src="../assets/normal-bg.png" class="background-image" />

        <div class="overlay">
            <div class="top-bar">
                <img src="../assets/mld-logo.png" class="logo" />
                <img src="../assets/art-n-sound.png" class="logo" />
            </div>

            <!-- First Lottie Animation Container -->
            <div ref="lottieContainer" class="lottie-animation"></div>

            <div class="title-text">
                <button class="next-button" @click="goToNext">S T A R T</button>
            </div>
            <!-- Second Lottie Animation Container -->
            <div ref="secondLottieContainer" class="second-lottie-animation"></div>
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
    width: 20%;
    height: auto;
    margin: 10px;
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
    margin-top: -30px;
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
    
    /* Animation properties */
    animation: buttonAppear 0.8s ease-out forwards;
    transform-origin: center;
    filter: blur(8px);
    opacity: 0;
    transform: scale(0.5);
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

.next-button:hover {
    background-color: #d35400;
    color: #ffffff;
}

.lottie-animation {
    margin-top: 150px;
    width: 100%;
    height: auto;
    align-self: center;
}

.second-lottie-animation {
    width: 110%;
    height: auto;
    align-self: center;
}
</style>