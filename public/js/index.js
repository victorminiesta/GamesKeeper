async function eliminarJuego(appid) {
    if (!confirm("¿Seguro que quieres eliminar este juego de favoritos?")) return;
    const res = await fetch(`/api/games/${appid}`, {
        method: 'PUT'
    });
    if (res.ok) {
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        carrito = carrito.filter(id => id !== appid);
        localStorage.setItem('carrito', JSON.stringify(carrito));
        
        loadGames();
    } else {
        console.error('Error al eliminar el juego');
    }
}

function formatearFecha(fechaOriginal) {
    const fecha = new Date(fechaOriginal);

    const horaEspania = new Date(fechaOriginal);
    horaEspania.setHours(horaEspania.getHours());

    const dia = fecha.toLocaleDateString('es-ES',{ year: 'numeric', month: 'long', day: '2-digit', timeZone: 'Europe/Madrid'});
    const hora = horaEspania.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' });

    return `${dia} ${hora}`;
}

function toggleCarrito(appid) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    if (carrito.includes(appid)) {
        carrito = carrito.filter(id => id !== appid);
    }
    else {
        carrito.push(appid);
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));

    loadGames();
}

async function loadGames() {
    try {
        const res = await fetch('api/games');
        const games = await res.json();

        const gamesContainer = document.getElementById('games');
        gamesContainer.innerHTML = '';

        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

        games.forEach(game => {
            const col = document.createElement('div');
            col.className = 'col-12 col-md-6 col-lg-4 mb-4';

            const enCarrito = carrito.includes(game.appid);

            col.innerHTML = `
                <div class="card bg-secondary text-white h-100">

                <button onclick="eliminarJuego(${game.appid})" class="btn btn-sm bg-light bg-opacity-75 text-dark position-absolute top-0 end-0 m-2 rounded shadow">
                    ❌
                </button>

                    <img src="${game.header_image}" class="card-img-top" alt="${game.nombre}">
                    <div class="card-body">
                        <p class="card-subtitle mb-2">${formatearFecha(game.fecha_agregado)}</p>
                        <h5 class="card-title">${game.nombre}</h5>
                        <p class="card-text">${game.description || 'Sin descripción'}</p>
                    </div>
                    <div class="card-footer">
                        Precio: <span class="badge bg-primary"> ${game.price || 'Gratis'}</span>
                        ${game.discount_percent > 0 ? `<span class="badge bg-success ms-2">🔥 Oferta: ${game.discount_percent}%</span>` : ''}
                        <button onclick="toggleCarrito(${game.appid})" 
                            class="btn btn-sm ${enCarrito ?  'btn-comprado' : 'btn-no-comprado'} rounded shadow float-end">
                            ⭐
                        </button>
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