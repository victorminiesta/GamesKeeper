import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';
import { execSync } from 'child_process';

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
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
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
        cookie: { 
            maxAge: 1000 * 60 * 60 * 24, 
            httpOnly: true,
            secure: false, // Cambiar a true si se usa HTTPS, SOLO en false para desarrollo local
            sameSite: 'lax' // Más compatible con CORS, cambiar en producnción a 'strict' si todo está en el mismo dominio
        }
    })
);

// Middleware para proteger las páginas
function ensureLoggedIn(req, res, next) {
    if (req.session.userId) return next();
    res.redirect('/bienvenida');
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

// Rutas pública
app.get('/bienvenida', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'welcome.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/perfil/editar', ensureLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'editarPerfil.html'));
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
    execSync('node setup-db.js', { stdio: 'inherit' });
    execSync('node import-steam-games.js', { stdio: 'inherit' });
}

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
