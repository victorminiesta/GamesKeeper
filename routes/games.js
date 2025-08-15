const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./data/db.sqlite3');

router.get('/', (req, res) => {
    db.all('SELECT * FROM mis_juegos WHERE appid IN (SELECT appid FROM steam_games WHERE favoritos = 1)', [], (err, rows) => {
        if (err) {
            console.error('Error al obtener juegos:', err.message);
            return res.status(500).json({ error: 'Error interno al obtener juegos' });
        }
        else {
            res.json(rows);
        }
    });
});

router.get('/buscar', (req, res) => {
    const query = req.query.q;

    if (!query) {
        return res.status(400).json({ error: 'Falta el parámetro de búsqueda (?q=)' });
    }

    const sql = `
        SELECT appid, name FROM steam_games
        WHERE name LIKE ?
        AND favoritos = 0 -- Solo juegos que no están en favoritos
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

                db.run (`UPDATE steam_games SET favoritos = 1 WHERE appid = ?`, [appid], (err) => {
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

router.put('/:appid', (req, res) => {
    const { appid } = req.params;
        db.run(
            'UPDATE steam_games SET favoritos = 0 WHERE appid = ?',
            [appid],
            function (err) {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Error al actualizar favoritos' });
                }
                res.json({ message: 'Juego eliminado correctamente' });
            }
        );
        }
    );

module.exports = router;
