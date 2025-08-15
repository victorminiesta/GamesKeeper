async function eliminarJuego(appid) {
    if (!confirm("¿Seguro que quieres eliminar este juego de favoritos?")) return;
    const res = await fetch(`/api/games/${appid}`, {
        method: 'DELETE'
    });
    if (res.ok) {
        loadGames();
    } else {
        console.error('Error al eliminar el juego');
    }
}

async function loadGames() {
    try {
        const res = await fetch('api/games');
        const games = await res.json();

        const gamesContainer = document.getElementById('games');
        gamesContainer.innerHTML = '';

        games.forEach(game => {
            const col = document.createElement('div');
            col.className = 'col-md-4 mb-4';

            col.innerHTML = `
                <div class="card bg-secondary text-white h-100">
                    <img src="${game.header_image}" class="card-img-top" alt="${game.nombre}">
                    <div class="card-body">
                        <h5 class="card-title">${game.nombre}</h5>
                        <p class="card-text">${game.description || 'Sin descripción'}</p>
                    </div>
                    <div class="card-footer">
                        Precio: <span class="badge bg-info"> ${game.price || 'Gratis'}</span>
                    </div>
                    <button onclick="eliminarJuego(${game.appid})" class="btn btn-danger">Eliminar</button>
                </div>
            `;
            gamesContainer.appendChild(col);
        });
    } 
    catch (err) {
        console.error('Error al cargar los juegos:', err);
    }
}

window.onload = loadGames;