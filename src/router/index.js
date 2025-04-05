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
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;