import express from 'express';
import sqlite3 from 'sqlite3';
import dotenv from 'dotenv';
import { ensureAuth } from './auth.js';
import bcrypt from 'bcrypt';
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

router.patch('/update', ensureAuth, (req, res) => {
    const userId = req.session.userId;
    const { username, email, password } = req.body;

    if (!username && !email && !password) {
        return res.status(400).json({ error: 'No hay datos para actualizar' });
    }

    const updates = [];
    const values = [];

    if (username) {
        updates.push('username = ?');
        values.push(username);
    }

    if (email) {
        updates.push('email = ?');
        values.push(email);
    }

    const updateUser = () => {
        const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
        values.push(userId);
        db.run(sql, values, function (err) {
            if (err) return res.status(500).json({error: 'Error al actualizar el usuario' });
            res.json({ ok: true });
        });
    };

    if (password) {
        bcrypt.hash(password, 10, (err, hashed) => {
            if (err) return res.status(500).json({error: 'Error al actualizar la contraseña' });
            updates.push('password = ?');
            values.push(hashed);
            updateUser();
        });
    }
    else{
        updateUser();
    }
});

export default router;