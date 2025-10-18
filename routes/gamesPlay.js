import express from 'express';
import sqlite3 from 'sqlite3';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const db = new sqlite3.Database(process.env.DATA_BASE_PATH);
const apiKey = process.env.PlatPrices_API_KEY;
const BASE_URL = 'https://platprices.com/api.php';


router.get('/buscar', async (req, res) => {
    const query = req.query.q;
    const region = req.query.region || 'ES';

    if (!query) {
        return res.status(400).json({ error: 'Falta el parámetro de búsqueda (?q=)' });
    }

    try {
        const url = `${BASE_URL}?key=${apiKey}&name=${encodeURIComponent(query)}&region=${region}`;
        console.log(`Buscando en Platprices: ${url}`);

        const response = await fetch(url);
        const data = await response.json();

        if (data.error === 0) {
            db.get(
                'SELECT appid FROM mis_juegos WHERE appid = ?',
                [data.appid],
                (err, row) => {
                    if (err) {
                        console.error('Error al verificar juego:', err);
                        return res.status(500).json({ error: 'Error interno' });
                    }

                    res.json({
                        ppid: data.PPID,
                        name : data.ProductName,
                        description: data.Desc,
                        image: data.CoverArt || data.Img,
                        price: data.formattedSalePrice || data.formattedBasePrice || 'Gratis',
                        discount: parseInt(data.DiscPercent) || 0,
                        platform: data.IsPS5 === "1" ? "ps5" : (data.IsPS4 === "1" ? "ps4" : "psn"),
                        isAdded: !!row
                    });
                }
            );
        }
        else {
            res.status(404).json({ error: data.errorDesc ||'Juego no encontrado'});
        }
    }
    catch (error) {
        console.error('Error al buscar en Platprices:', error);
        res.status(500).json({ error: 'Error interno al buscar el juego'});
    }
});


export default router;