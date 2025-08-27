import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import games from './routes/games.js';
import perfil from './routes/perfil.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.static('public'));
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use('/api/games', games);
app.use('/api/perfil', perfil);

app.get('/buscar', (req, res) => {
  res.sendFile(__dirname + '/public/buscar.html');
});

app.get('/perfil', (req, res) => {
  res.sendFile(__dirname + '/public/perfil.html');
});

if (!fs.existsSync('./data/db.sqlite3')) {
    console.log('Creando base de datos e importando juegos...');
    const { execSync } = require('child_process');
    execSync('node setup-db.js', { stdio: 'inherit' });
    execSync('node import-steam-games.js', { stdio: 'inherit' });
}

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

