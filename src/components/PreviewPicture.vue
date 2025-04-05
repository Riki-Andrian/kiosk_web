<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  image: {
    type: String,
    required: true
  }
});
</script>

<template>
  <div>
    <h2>Captured Image</h2>
    <img :src="image" alt="Captured" />
  </div>
</template>
