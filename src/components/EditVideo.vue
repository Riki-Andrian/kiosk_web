<script setup>
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { ref, onMounted } from "vue";
import videoSrc from "@/assets/template.mp4";
import video1 from "@/assets/video/ENTP-ENFP.mp4";
import video2 from "@/assets/video/ESFJ-ENFJ.mp4";
import video3 from "@/assets/video/ESTP-ESFP.mp4";
import video4 from "@/assets/video/INFJ-INFP.mp4";
import video5 from "@/assets/video/INTJ-INTP.mp4";
import mld_kiosk from "@/assets/mld_kiosk.mp3"

const ffmpeg = createFFmpeg({ log: true });
const videoFile = ref(null);
const outputUrl = ref(null);
const userName = ref("John Doe");
const imageCoord = ref(null);

const props = defineProps({
  overlayImage: {
    type: String,
    required: true
  },
  personality: {
    type: String,
    required: true
  }
});

const loadComponent = async () => {
  await ffmpeg.load();
  console.log("FFmpeg is ready!");
  chooseVideo();
};

onMounted(loadComponent);

const chooseVideo = () => {
  switch (props.personality) {
    case "ENTP":
    case "ENFP":
      videoFile.value = video1;
      imageCoord.value = "75:380";
      break;
    case "ESFJ":
    case "ENFJ":
      videoFile.value = video2;
      imageCoord.value = "185:737";
      break;
    case "ESTP":
    case "ESFP":
      videoFile.value = video3;
      imageCoord.value = "200:645";
      break;
    case "INFJ":
    case "INFP":
      videoFile.value = video4;
      imageCoord.value = "350:685";
      break;
    case "INTJ":
    case "INTP":
      videoFile.value = video5;
      imageCoord.value = "185:350";
      break;
    default:
      videoFile.value = videoSrc;
  }
}

const processVideo = async () => {
  if (!videoFile.value || !props.overlayImage) {
    alert("Please select a video and an image!");
    return;
  }

  const videoName = "input.mp4";
  const overlayName = "overlay.png";
  const outputName = "output.mp4";
  const musik = "musik.mp3"

  try {
    //donlot imej wak
    const response = await fetch(props.overlayImage);
    const overlayBlob = await response.blob();
    const overlayArrayBuffer = await overlayBlob.arrayBuffer();

    ffmpeg.FS("writeFile", videoName, await fetchFile(videoFile.value));
    ffmpeg.FS("writeFile", overlayName, new Uint8Array(overlayArrayBuffer));
    ffmpeg.FS("writeFile", musik, await fetchFile(mld_kiosk));

    await ffmpeg.run(
      "-i", videoName,
      "-loop", "1",
      "-t", "5",
      "-i", overlayName,
      "-i", musik,
      "-filter_complex",
      `[1:v] format=yuva420p, scale=320:320, fade=t=in:st=0:d=1:alpha=1 [ovl]; [0:v][ovl] overlay=${imageCoord.value}`,
      "-map", "0:v",           // ambil video dari input ke-0
      "-map", "2:a",           // ambil audio dari input ke-2 (musik)
      "-c:v", "libx264",
      "-preset", "veryfast",
      "-crf", "23",
      "-threads", "4",
      "-b:v", "700k",
      "-c:a", "aac",           // encode audio
      "-shortest",            // output durasi sependek input terpendek
      // "-c:a", "copy",
      outputName
    );
    // Periksa jika output file berhasil ditulis di sistem file FFmpeg
    console.log("Checking if the output file exists...");
    const files = ffmpeg.FS("readdir", "/");
    console.log("Files in virtual FS:", files); // Menampilkan file yang ada di FFmpeg virtual FS

    if (!files.includes(outputName)) {
      console.error("Output file not found after processing.");
      return;
    }

    const outputData = ffmpeg.FS("readFile", outputName);
    const outputBlob = new Blob([outputData.buffer], { type: "video/mp4" });
    outputUrl.value = URL.createObjectURL(outputBlob);
  } catch (error) {
    console.error("Error processing video:", error);
    alert("There was an error processing the video.");
  }
};
</script>

<template>
  <div>
    <button @click="processVideo">Overlay Image</button>

    <video v-if="outputUrl" :src="outputUrl" controls></video>
  </div>
</template>
