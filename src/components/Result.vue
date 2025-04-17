<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();
const videoUrl = route.query.videoUrl;
</script>

<template>
  <div class="result-container">
    <h1>Video Result</h1>
    <video v-if="videoUrl" :src="videoUrl" controls width="80%" />
    <p v-else>Video URL not found.</p>
  </div>
</template>
