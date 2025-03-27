import express from 'express';
const app = express();
const port = 3000;
import url from "url";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

app.get('/', (req, res) => {
    res.sendFile("./page/index.html", {root: __dirname});
})

app.get('/form', (req, res) => {
    res.sendFile("./page/form_nama.html", {root: __dirname});
})

app.get('/pertanyaan', (req, res) => {
    res.sendFile("./page/pertanyaan.html", {root: __dirname});
})

app.get('/kamera', (req, res) => {
    res.sendFile("./page/kamera.html", {root: __dirname});
})

app.use("*", (req, res) => {
    res.status(404)
    res.send('Halaman tidak ditemukan')
})

app.listen(port, () => {
    console.log(`Example app listening at  http://localhost:${port}`)
})