import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import games from './routes/games.js';
import perfil from './routes/perfil.js';
import authRoutes from './routes/auth.js';
import userGamesRoutes from './routes/userGames.js';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';
import { dir } from 'console';
import { ensureAuth } from './routes/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.static('public'));
const PORT = process.env.PORT || 3000;

app.use(cors());
app.get('/', (req, res) => {
    if (req.session.userId) {
        res.sendFile(path.join(__dirname, 'public', 'index.html')); // usuario logueado
    } else {
        res.redirect('/Bienvenida'); // no logueado → pantalla de bienvenida
    }
});
app.get('/Bienvenida', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'welcome.html'));
});
app.use('/api/games', games);
app.use('/api/perfil', perfil);
app.use('/auth', authRoutes);
app.use('/api/user/games', userGamesRoutes);
app.use(
    session({
      store: new SQLiteStore({
        db: 'sessions.sqlite',
        dir: './data',
      }),
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 1000 * 60 * 60 * 24 }
    })
);

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

