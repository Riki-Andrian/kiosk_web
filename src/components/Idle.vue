<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import lottie from "lottie-web";

const router = useRouter();

// References for the Lottie containers
const lottieContainer = ref(null);
let lottieInstance = null;

// Function to navigate to the next page after playing the "start-out" animation
const goToNext = async () => {
    try {
        // Destroy the current "music-idle.json" animation
        if (lottieInstance) {
            lottieInstance.destroy();
        }

        // Load and play the "music-out.json" animation
        const outResponse = await fetch(new URL('@/assets/lottie/home-page/home-out.json', import.meta.url));
        const outAnimationData = await outResponse.json();

        lottieInstance = lottie.loadAnimation({
            container: lottieContainer.value,
            renderer: "svg",
            loop: false, // Do not loop the out animation
            autoplay: true,
            animationData: outAnimationData,
        });

        // Optionally, navigate to the next page after "music-out.json" completes
        lottieInstance.addEventListener("complete", () => {
            router.push("/start"); // Navigate to the next page
        });
    } catch (error) {
        console.error("Error switching animations in 'goToNext':", error);
    }
};

// Initialize the "start-in" and second Lottie animations
onMounted(async () => {
    try {
        console.clear();
        // Load and play the "home-in.json" animation
        const response = await fetch(new URL('@/assets/lottie/home-page/home-in.json', import.meta.url));
        const animationData = await response.json();

        lottieInstance = lottie.loadAnimation({
            container: lottieContainer.value,
            renderer: "svg",
            loop: false, // Do not loop the "home-in.json" animation
            autoplay: true,
            animationData,
        });

        // Wait for the "home-in.json" animation to complete
        lottieInstance.addEventListener("complete", async () => {
            // Load and play the "home-idle.json" animation
            const idleResponse = await fetch(new URL('@/assets/lottie/home-page/home-idle.json', import.meta.url));
            const idleAnimationData = await idleResponse.json();

            lottieInstance.destroy(); // Destroy the "home-in.json" animation
            lottieInstance = lottie.loadAnimation({
                container: lottieContainer.value,
                renderer: "svg",
                loop: true, // Set to true to keep "home-idle.json" looping
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
    <div class="app-container">
        <img src="../assets/normal-bg.png" class="background-image" />

        <div class="overlay">
              <img src="../assets/mld-logo.png" class="top-right" />
           <img src="../assets/art-n-sound.png" class="bottom-left" />
            <!-- First Lottie Animation Container -->
            <div ref="lottieContainer" class="lottie-animation" @click="goToNext"></div>
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

.top-right {
    position: absolute; /* Position the image absolutely */
    right: 5%; /* Align to the right */
    top: 5%; /* Distance from the top */
    width: 50%; /* Adjust width as needed */
    height: auto;
    margin: 0; /* Remove any margin */
    z-index: 2;

    /* Animation properties */
    animation: blurSlideInTopBottom 1.5s ease-out forwards;
    opacity: 0; /* Start invisible */
    filter: blur(15px); /* Start blurred */
    transform: translateY(-50px); /* Start from above */
}

.bottom-left {
    position: absolute;
    left: 5%; /* Align to the left */
    bottom: 5%; /* Distance from the bottom */
    width: 40%; /* Adjust width as needed */
    height: auto;
    margin: 0; /* Remove any margin */
    z-index: 2;

     /* Animation properties */
    animation: blurSlideInBottomTop 1.5s ease-out forwards;
    opacity: 0; /* Start invisible */
    filter: blur(15px); /* Start blurred */
    transform: translateY(50px); /* Start from below */
}

@keyframes blurSlideInBottomTop {
    0% {
        opacity: 0;
        filter: blur(15px);
        transform: translateY(50px);
    }
    100% {
        opacity: 1;
        filter: blur(0);
        transform: translateY(0);
    }
}

@keyframes blurSlideInTopBottom {
    0% {
        opacity: 0;
        filter: blur(15px);
        transform: translateY(-50px);
    }
    100% {
        opacity: 1;
        filter: blur(0);
        transform: translateY(0);
    }
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
}

.next-button:hover {
    background-color: #d35400;
    color: #ffffff;
}

.lottie-animation {
    width: 160%;
    height: auto;
    align-self: center;
}
</style>