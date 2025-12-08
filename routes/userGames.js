import express from 'express';
import sqlite3 from 'sqlite3';
import { ensureAuth } from './auth.js';

const router = express.Router();

const db = new sqlite3.Database(process.env.DATA_BASE_PATH);

// Añadir juego
router.post('/add', ensureAuth, (req, res) => {
   const userId = req.session.userId;
   const { appid } =  req.body;
   db.run(
        `INSERT OR IGNORE INTO user_games (user_id, appid, favoritos) VALUES (?, ?, 1)`, [userId, appid], function (err) {
            if (err) return res.status(500).json({error: 'Error al añadir el juego'});
            res.json({ok: true, added: this.changes > 0});
    });
});

// Listar juegos del usuario
router.get('/', (req, res) => {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ error: 'No logueado' });

    db.all(
        `
        SELECT user_games.appid,
               mis_juegos.nombre,
               mis_juegos.description,
               mis_juegos.header_image,
               mis_juegos.price,
               mis_juegos.discount_percent,
               mis_juegos.last_updated,
               mis_juegos.fecha_agregado
        FROM user_games
        LEFT JOIN mis_juegos ON user_games.appid = mis_juegos.appid
        WHERE user_games.user_id = ? AND user_games.favoritos = 1
        ORDER BY mis_juegos.nombre COLLATE NOCASE ASC
        `,
        [userId],
        async (err, rows) => {
            if (err) return res.status(500).json({ error: 'Error al obtener los juegos' });

            const ahora = Date.now();
            const chunkSize = 10;
            let resultados = [];

            for (let i = 0; i < rows.length; i += chunkSize) {
                const chunk = rows.slice(i, i + chunkSize);

                const resultadosChunk = await Promise.all(
                    chunk.map(async (juego) => {
                        const cacheExpiration = Number(process.env.CACHE_EXPIRATION) || 86400000;
                        const ultimaActualizacion = Number(juego.last_updated);

                        if (!ultimaActualizacion || (ahora - ultimaActualizacion) > cacheExpiration) {
                            try {
                                const url = `https://store.steampowered.com/api/appdetails?appids=${juego.appid}&cc=es&l=spanish`;
                                const resp = await fetch(url);
                                const data = await resp.json();
                                const detalles = data[juego.appid]?.data;

                                if (detalles && detalles.price_overview) {
                                    const price = detalles.price_overview.final_formatted || 'Gratis';
                                    const discount = detalles.price_overview.discount_percent || 0;

                                    db.run(
                                        `UPDATE mis_juegos
                                         SET price = ?, discount_percent = ?, last_updated = ?
                                         WHERE appid = ?`,
                                        [price, discount, ahora, juego.appid]
                                    );

                                    return { ...juego, price, discount_percent: discount };
                                }
                            } catch (error) {
                                console.error(`Error al consultar API Steam para ${juego.appid}:`, error);
                            }
                        }

                        return juego;
                    })
                );

                resultados = resultados.concat(resultadosChunk);
            }

            res.json(resultados);
        }
    );
});


// Eliminar juego
router.put('/:appid', ensureAuth, (req, res) => {
    const userId = req.session.userId;
    const { appid } = req.params;

    db.run(`UPDATE user_games SET favoritos = 0 WHERE user_id = ? AND appid = ?`,
        [userId, appid],
        function (err) {
            if (err) return res.status(500).json({error: 'Error al quitar el juego' });
            res.json({ ok: true, updated: this.changes > 0 });
        }
    );
});

export default router;