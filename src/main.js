import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

if (import.meta.env.PROD) {
  app.config.devtools = false
}

app.use(router).mount('#app')