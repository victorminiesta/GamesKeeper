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

db.serialize(() => {

    db.run(`
        CREATE TABLE IF NOT EXISTS steam_games (
            appid INTEGER PRIMARY KEY,
            name TEXT NOT NULL
        )    
    `);

    db.run (`
        CREATE TABLE IF NOT EXISTS mis_juegos (
            appid INTEGER NOT NULL PRIMARY KEY,
            nombre TEXT,
            description TEXT,
            header_image TEXT,
            price TEXT,
            discount_percent INTEGER DEFAULT 0,
            last_updated INTEGER,
            fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) 
    `);

    db.run (`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            email TEXT UNIQUE,
            password TEXT NOT NULL,
            created_at TIMESTAMP CURRENT_TIMESTAMP
        )
    `);

    db.run (`
        CREATE TABLE IF NOT EXISTS user_games (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            appid INTEGER NOT NULL,
            added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            favoritos BOOLEAN DEFAULT 1,
            UNIQUE(user_id, appid),
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(appid) REFERENCES steam_games(appid)
        )
    `);

    console.log('Tablas creadas o ya existían correctamente.');
});


db.close((err) => {
    if (err) {
        console.error('Error al cerrar la base de datos:', err.message);
    }
    else{
        console.log('Base de datos cerrada correctamente.');
    }
});