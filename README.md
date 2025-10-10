# 🎮 Mis Juegos

Proyecto personal hecho en **Node.js + Express + SQLite3** para gestionar una lista de juegos de Steam y PS4/PS5.  
La idea es tener un panel sencillo donde puedo:  
- Buscar juegos de Steam o de play.  
- Guardarlos en mi base de datos local.  
- Marcar favoritos o pendientes.  
- Tener una interfaz limpia y simple con **Bootstrap**.  

---

## 🚀 Tecnologías usadas
- [Node.js](https://nodejs.org/)  
- [Express.js](https://expressjs.com/)  
- [SQLite3](https://www.sqlite.org/index.html)  
- [Bootstrap 5](https://getbootstrap.com/)  

---

## ⚙️ Instalación y uso
1. Clonar el repositorio:
   ```bash
   git clone https://github.com/victorminiesta/SteamKeeper.git
   cd SteamKeeper

2. Instalar dependencias:
   ```bash
   npm install

3. Crear la base de datos:
   ```bash
   node setup-db.js

4. Importar todos los juegos de Steam:
   ```bash
   node import-steam-games.js
  ⚠️ Advertencia: la primera vez puede tardar bastante tiempo porque descarga y guarda todos los juegos con sus IDs.

5. Ejecutar el Servidor:
   ```bash
   node server.js

6. Abrir el navegador:
   ```bash
   http://localhost:3000
