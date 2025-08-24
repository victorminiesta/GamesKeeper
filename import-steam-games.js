import sqlite3 from 'sqlite3';
sqlite3.verbose();

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
        const res = await fetch('https://api.steampowered.com/ISteamApps/GetAppList/v2/');
        const data = await res.json();
        const games = data.applist.apps;

        console.log(`Total de juegos encontrados: ${games.length}`);

        const insert = db.prepare(`
            INSERT OR IGNORE INTO steam_games (appid, name)
            VALUES (?, ?)
        `);

        let count = 0;

        db.serialize(() => {
            for (const game of games) {
                if (game.name && game.name.trim() !== '') {
                    const nombreLimpio = limpiarNombreJuego(game.name);
                    insert.run(game.appid, nombreLimpio);
                    count++;
                }
            }

            insert.finalize(() => {
                console.log(`Se insertaron ${count} juegos en la base de datos.`);
                db.close();
            });
        })
    }
    catch (error) {
        console.error('Error al descargar la lista de juegos de Steam:', error);
    }
}

importarJuegos();