import Pertanyaan from "@/components/Pertanyaan.vue";
import Edit from "@/views/Edit.vue";
import Home from "@/views/Home.vue";
import { createRouter, createWebHistory } from "vue-router";

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
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;