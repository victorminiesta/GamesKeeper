import express from 'express';
import bcrypt from 'bcrypt';
import sqlite3 from 'sqlite3';

const router = express.Router();

const db = new sqlite3.Database(process.env.DATA_BASE_PATH);

export function ensureAuth(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    // Si no está logueado, redirige a welcome
    res.redirect('/Bienvenida');
}

// Registro de usuario
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Faltan datos' });

    const hashed = await bcrypt.hash(password, 10);

    db.run(
        `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
        [username, email || null, hashed],
        function (err) {
            if (err) return res.status(409).json({ error: 'Usuario ya existe' });
            req.session.userId = this.lastID;
            res.json({ok: true, userId: this.lastID});
        }
    );
});


// Login de usuario
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
        if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: 'Contraseña incorrecta' });
        req.session.userId = user.id;
        res.json({ok: true, userId: user.id});
    });
});


// Logout de usuario
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ error: 'Error al cerrar sesión' });
        res.json({ok: true});
    });
});

export default router;
