async function eliminarJuego(appid) {
    if (!confirm("¿Seguro que quieres eliminar este juego de favoritos?")) return;
    const res = await fetch(`/api/games/${appid}`, {
        method: 'PUT'
    });
    if (res.ok) {
        loadGames();
    } else {
        console.error('Error al eliminar el juego');
    }
}

function formatearFecha(fechaOriginal) {
    const fecha = new Date(fechaOriginal);

    const horaEspania = new Date(fechaOriginal);
    horaEspania.setHours(horaEspania.getHours() + 2);

    const dia = fecha.toLocaleDateString('es-ES',{ year: 'numeric', month: 'long', day: '2-digit', timeZone: 'Europe/Madrid'});
    const hora = horaEspania.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' });

    return `${dia} ${hora}`;
}

async function loadGames() {
    try {
        const res = await fetch('api/games');
        const games = await res.json();

        const gamesContainer = document.getElementById('games');
        gamesContainer.innerHTML = '';

        games.forEach(game => {
            const col = document.createElement('div');
            col.className = 'col-12 col-md-6 col-lg-4 mb-4';

            col.innerHTML = `
                <div class="card bg-secondary text-white h-100">

                <button onclick="eliminarJuego(${game.appid})" class="btn btn-sm btn-light text-dark position-absolute top-0 end-0 m-2 rounded shadow">
                    ❌
                </button>

                    <img src="${game.header_image}" class="card-img-top" alt="${game.nombre}">
                    <div class="card-body">
                        <p class="card-subtitle mb-2">${formatearFecha(game.fecha_agregado)}</p>
                        <h5 class="card-title">${game.nombre}</h5>
                        <p class="card-text">${game.description || 'Sin descripción'}</p>
                    </div>
                    <div class="card-footer">
                        Precio: <span class="badge bg-info"> ${game.price || 'Gratis'}</span>
                        ${game.discount_percent > 0 ? `<span class="badge bg-success ms-2">🔥 Oferta: ${game.discount_percent}%</span>` : ''}
                    </div>
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