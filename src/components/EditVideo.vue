<script setup>
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { ref, onMounted } from "vue";
import videoSrc from "@/assets/template.mp4"; 

const ffmpeg = createFFmpeg({ log: true });
const videoFile = ref(null);
const outputUrl = ref(null);
const userName = ref("John Doe");

const props = defineProps({
  overlayImage: {
    type: String,
    required: true
  }
});

const loadComponent = async () => {
    videoFile.value = videoSrc;
        
    await ffmpeg.load();
    console.log("FFmpeg is ready!");
};

onMounted(loadComponent);

const processVideo = async () => {
  if (!videoFile.value || !props.overlayImage) {
    alert("Please select a video and an image!");
    return;
  }

  const videoName = "input.mp4";
  const overlayName = "overlay.png";
  const outputName = "output.mp4";

  //donlot imej wak
  const response = await fetch(props.overlayImage);
  const overlayBlob = await response.blob();
  const overlayArrayBuffer = await overlayBlob.arrayBuffer();

  ffmpeg.FS("writeFile", videoName, await fetchFile(videoFile.value));
  ffmpeg.FS("writeFile", overlayName, new Uint8Array(overlayArrayBuffer));

  await ffmpeg.run(
    "-i", videoName,
    "-i", overlayName,
    "-filter_complex",
    "[1:v] scale=320:320 [scaled]; [0:v][scaled] overlay=205:340",
    "-c:v", "libx264",
    "-preset", "veryfast",
    "-crf", "23",
    "-b:v", "700k",
    "-threads", "4",
    "-c:a", "copy",
    outputName
  );

  const outputData = ffmpeg.FS("readFile", outputName);
  const outputBlob = new Blob([outputData.buffer], { type: "video/mp4" });
  outputUrl.value = URL.createObjectURL(outputBlob);
};
</script>

<template>
  <div>
    <button @click="processVideo">Overlay Image</button>

    <video v-if="outputUrl" :src="outputUrl" controls></video>
  </div>
</template>
