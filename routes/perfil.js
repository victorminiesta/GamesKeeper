import express from 'express';
import sqlite3 from 'sqlite3';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

const perfilApiUrl = process.env.PERFIL_API_URL;

const db = new sqlite3.Database(process.env.DATA_BASE_PATH);

router.get('/perfilSteam', async (req, res) => {
    try {
        const response = await fetch(perfilApiUrl);
        const data = await response.json();
        const perfil = data.response.players[0];

        res.json({
            nombre: perfil.personaname,
            avatar: perfil.avatarfull,
            perfilUrl: perfil.profileurl,
            estado: (perfil.personastate === 1) ? '🟢 En línea' : '🔴 Desconectado',
            creado: perfil.timecreated ? new Date(perfil.timecreated * 1000).toLocaleDateString("es-ES") : 'Desconocido',
            ultimaVisita: perfil.lastlogoff ? new Date(perfil.lastlogoff * 1000).toLocaleDateString("es-ES") : 'Desconocido',
        });
    }
    catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ error: 'Error interno al obtener perfil' });
    }
});

router.get('/me', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'No logueado' });

    db.get(`SELECT id, username, email FROM users WHERE id = ?`, [req.session.userId], (err, user) => {
        if (err) return res.status(500).json({ error: 'Error al obtener el usuario' });
        res.json(user);
    });
});

export default router;