import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Sajikan file statis dari folder CSS
app.use(express.static(path.join(__dirname, 'css')));

// Routing ke halaman HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'page/index.html'));
});

app.get('/form', (req, res) => {
    res.sendFile(path.join(__dirname, 'page/form_nama.html'));
});

app.get('/pertanyaan', (req, res) => {
    res.sendFile(path.join(__dirname, 'page/pertanyaan.html'));
});

app.get('/kamera', (req, res) => {
    res.sendFile(path.join(__dirname, 'page/kamera.html'));
});

// Handle 404 - Halaman tidak ditemukan
app.use("*", (req, res) => {
    res.status(404).send('Halaman tidak ditemukan');
});

// Jalankan server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
