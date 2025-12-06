import express from 'express';
import sqlite3 from 'sqlite3';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

const db = new sqlite3.Database(process.env.DATA_BASE_PATH);

router.get('/', (req, res) => { 
    db.all(
        'SELECT * FROM mis_juegos ORDER BY nombre COLLATE NOCASE ASC',
        [],
        async (err, rows) => {
            if (err) {
                console.error('Error al obtener juegos:', err.message);
                return res.status(500).json({ error: 'Error interno al obtener juegos' });
            }

            const ahora = Date.now();

            const chunkSize = 10;
            let resultados = [];

            for (let i = 0; i < rows.length; i += chunkSize) {
                const chunk = rows.slice(i, i + chunkSize);

                const resultadosChunk = await Promise.all(
                    chunk.map(async (juego) => {
                        const cacheExpiration = Number(process.env.CACHE_EXPIRATION) || 86400000; // 1 día por defecto
                        const ultimaActualizacion = Number(juego.last_updated);

                        // Si no tiene last_updated o ha pasado más de 1 día actualizamos
                        if (!ultimaActualizacion || (ahora - ultimaActualizacion) > cacheExpiration) {
                            console.log("actualizando el juego", juego.nombre);
                            try {
                                const url = `https://store.steampowered.com/api/appdetails?appids=${juego.appid}&cc=es&l=spanish`;
                                const resp = await fetch(url);
                                const data = await resp.json();
                                const detalles = data[juego.appid]?.data;

                                if (detalles && detalles.price_overview) {
                                    const price = detalles.price_overview.final_formatted || 'Gratis';
                                    const discount = detalles.price_overview.discount_percent || 0;

                                    // Actualizamos en la base de datos
                                    db.run(
                                        `UPDATE mis_juegos 
                                        SET price = ?, discount_percent = ?, last_updated = ? 
                                        WHERE appid = ?`,
                                        [price, discount, ahora, juego.appid]
                                    );

                                    console.log("Juego actualizado:", juego.nombre);
                                    
                                    return {
                                        ...juego,
                                        price,
                                        discount_percent: discount
                                    };
                                }
                            } catch (error) {
                                console.error(`Error al consultar API Steam para ${juego.appid}:`, error);
                            }
                        }

                        // Si no necesita actualización, devolvemos tal cual
                        return juego;
                    })
                );

                resultados = resultados.concat(resultadosChunk);
            }

            res.json(resultados);
        }
    );
});

router.get('/buscar', (req, res) => {
    const query = req.query.q;

    if (!query) {
        return res.status(400).json({ error: 'Falta el parámetro de búsqueda (?q=)' });
    }

    const sql = `
        SELECT appid, name FROM steam_games
        WHERE name LIKE ?
        ORDER BY name COLLATE NOCASE ASC
        LIMIT 400 
    `;

    const searchTerm = `%${query}%`;

    db.all(sql, [searchTerm], (err, rows) => {
        if (err) {
            console.error('Error al buscar juegos:', err.message);
            return res.status(500).json({ error: 'Error interno al buscar juegos' });
        }

        res.json(rows);
    });
});

router.post('/:appid', async (req, res) => {
    const { appid } = req.params;

    try {
        let response = await fetch (`https://store.steampowered.com/api/appdetails?appids=${appid}&cc=es&l=spanish`);
        console.log(`https://store.steampowered.com/api/appdetails?appids=${appid}&cc=es&l=spanish`);
        let gameData = await response.json();
        if (!gameData[appid].success) {
            console.log(`⚠ No encontrado en español, buscando en inglés: ${appid}`);
            const resEn = await fetch (`https://store.steampowered.com/api/appdetails?appids=${appid}`);
            console.log(`https://store.steampowered.com/api/appdetails?appids=${appid}`);
            gameData = await resEn.json();
        }

        const data = gameData[appid].data;

        db.run(`
            INSERT OR IGNORE INTO mis_juegos (appid, nombre, description, header_image, price)
            VALUES (?, ?, ?, ?, ?)`, 
            [
                appid,
                data.name,
                data.short_description || '',
                data.header_image,
                data.price_overview ? `${data.price_overview.final / 100}€` : 'Gratis'
            ],
            (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Error al añadir el juego' });
                }

                const ahora = Date.now();

                db.run (`UPDATE mis_juegos SET fecha_agregado = ${ahora} WHERE appid = ?`, [appid], (err) => {
                    if (err) console.error(err);
                });

                res.json({ message: 'Juego añadido a favoritos' });
            }
        );
    }
    catch (error) {
        console.error('Error al obtener datos del juego:', error);
        res.status(500).json({ error: 'Error interno al obtener datos del juego' });
    }
});

export default router;
