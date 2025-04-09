import Pertanyaan from "@/views/Pertanyaan.vue";
import Edit from "@/views/Edit.vue";
import FormNama from "@/views/FormNama.vue";
import Home from "@/views/Home.vue";
import { createRouter, createWebHistory } from "vue-router";
import Camera from "@/views/Camera.vue";

const routes = [
    {
        path: "/",
        component: Home,
    },
    {
        path: "/edit",
        component: Edit,
    },
    {
        path: "/pertanyaan",
        component: Pertanyaan,
    },
    {
        path: "/form",
        component: FormNama,
    },
    {
        path: "/camera",
        component: Camera,
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;