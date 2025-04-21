import Pertanyaan from "@/views/Pertanyaan.vue";
import Edit from "@/views/Edit.vue";
import FormNama from "@/views/FormNama.vue";
import Home from "@/views/Home.vue";
import { createRouter, createWebHistory } from "vue-router";
import Camera from "@/views/Camera.vue";
import Start from "@/views/Start.vue";
import Loading from "@/views/Loading.vue";
import Result from "@/views/Result.vue";
import CameraTest from "@/views/CameraTest.vue";
import Idle from "@/views/Idle.vue";


const routes = [
    {
        path: "/",
        component: Idle,
    },
    {
        path: "/start",
        component: Start,
    },
    {
        path: "/form",
        component: FormNama,
    },
    {
        path: "/edit/:personality",
        component: Edit,
    },
    {
        path: "/pertanyaan",
        component: Pertanyaan,
    },
    {
        path: "/camera/:personality",
        component: Camera,
    },
    {
        path: "/cameratest/:personality",
        component: CameraTest,
    },
    {
        path: "/loading",
        component: Loading,
    },
    {
        path: '/result',
        name: 'Result',
        component: Result,
        props: true,  // Mengizinkan props dari route
      },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;