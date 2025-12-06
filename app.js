import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';

// Rutas
import games from './routes/games.js';
import perfil from './routes/perfil.js';
import authRoutes from './routes/auth.js';
import userGamesRoutes from './routes/userGames.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware global
app.use(cors());
app.use(express.json());

const SQLiteStore = connectSqlite3(session);

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

// Middleware para proteger las páginas
function ensureLoggedIn(req, res, next) {
    if (req.session.userId) return next();
    res.redirect('/Bienvenida');
}

// Rutas del front protegidas
app.get('/', ensureLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/buscar', ensureLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'buscar.html'));
});

app.get('/perfil', ensureLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'perfil.html'));
});

// Ruta pública
app.get('/Bienvenida', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'welcome.html'));
});

// Archivos estáticos (pueden incluir CSS, JS, imágenes)
app.use(express.static(path.join(__dirname, 'public')));

// Rutas API
app.use('/api/games', games);
app.use('/api/perfil', perfil);
app.use('/api/user/games', userGamesRoutes);
app.use('/auth', authRoutes);

// Crear base de datos si no existe
if (!fs.existsSync('./data/db.sqlite3')) {
    console.log('Creando base de datos e importando juegos...');
    const { execSync } = require('child_process');
    execSync('node setup-db.js', { stdio: 'inherit' });
    execSync('node import-steam-games.js', { stdio: 'inherit' });
}

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
