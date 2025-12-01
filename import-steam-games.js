import sqlite3 from 'sqlite3';
sqlite3.verbose();
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.STEAM_API_KEY;

const db = new sqlite3.Database('./data/db.sqlite3', (err) => {
    if (err)  {
        console.error('Error al abrir la base de datos:', err.message);
    }
    else{
        console.log('Base de datos abierta correctamente.');
    }
});

function limpiarNombreJuego(nombre) {
    return nombre
        .toLowerCase()
        .normalize('NFD')                  
        .replace(/[\u0300-\u036f]/g, '')     
        .replace(/[™:®\/\(\)]+/g, '')  
        .replace(/-/g, ' ')  
        .replace(/[’‘]/g, "'")              
        .trim();
}

async function importarJuegos() {
    try {
        console.log('Descargando lista de juegos de Steam...');

        let ultimaAppId = 0;
        let totalInsertados = 0;
        const insert = db.prepare(`
            INSERT OR IGNORE INTO steam_games (appid, name) 
            VALUES (?, ?)
        `);

        while (true) {
            const url = `https://api.steampowered.com/IStoreService/GetAppList/v1/?key=${apiKey}&max_results=50000&last_appid=${ultimaAppId}`;

            console.log(`Solicitand: ${url}`);

            const res = await fetch(url);
            const data = await res.json();

            const {apps, have_more_results, last_appid} = data.response;

            console.log(`Lote recibido: ${apps.length} juegos`);

            db.serialize(() => {
                for (const game of apps) {
                    if (game.appid && game.name.trim() !== '') {
                        const nombreLimpio = limpiarNombreJuego(game.name);
                        insert.run(game.appid, nombreLimpio);
                        totalInsertados++;
                    }
                }
            });

            if (!have_more_results) {
                console.log("No hay mas resultados. Importación completa.");
                break;
            }
            ultimaAppId = last_appid;
        }

        insert.finalize(() => {
            console.log(`Total final insertado: ${totalInsertados} juegos.`);
            db.close();
        });
    } catch (error) {
        console.error('Error al importar juegos de Steam:', error);
    }
}

importarJuegos();