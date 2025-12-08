document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');

    searchInput.addEventListener('input', () => {
        buscarJuegos();
    });

});


async function añadirJuego(appid) {
    try {
        // 1️⃣ Primero añadirlo a mis_juegos
        const resCache = await fetch(`/api/games/${appid}`, {
            method: 'POST'
        });

        if (!resCache.ok) {
            const data = await resCache.json();
            alert('Error al añadir a mis_juegos: ' + (data.error || resCache.status));
            return;
        }

        // 2️⃣ Luego añadirlo a user_games
        const resUser = await fetch('/api/user/games/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ appid })
        });

        if (resUser.ok) {
            alert('Juego añadido a favoritos');
        } else {
            const data = await resUser.json();
            alert('Error al añadir a favoritos del usuario: ' + (data.error || resUser.status));
        }

    } catch (error) {
        console.error(error);
        alert('Error inesperado al añadir el juego');
    }
}


async function buscarJuegos() {
    const query = document.getElementById('searchInput').value.trim();
    const div = document.getElementById('results');

    if (!query) {
        div.innerHTML = '<h2 class="text-center">Escribe algo para buscar</h2>';
        return;
    }

    div.innerHTML = '<h3 class="text-center">Buscando...</h3>';

    try {
        const res = await fetch(`/api/games/buscar?q=${encodeURIComponent(query)}`);
        const juegos = await res.json();

        if (juegos.length === 0) {
            div.innerHTML = '<p>No se encontraron juegos</p>';
            return;
        }

        div.innerHTML = juegos.map(juego => 
            `<div class="col-md-4">
                <div class="card shadow-lg h-100 text-white" style="background: linear-gradient(135deg, #6a11cb, #2575fc); border-radius: 12px; padding: 20px;">
                    <h3 class="mb-3">${juego.name}</h3>
                    <button class="btn btn-success w-100 fw-bold" onclick="añadirJuego(${juego.appid})">⚡ Añadir</button>
                </div>
            </div>`).join('');
    }
    catch (err) {
        console.error('Error al buscar juegos: ', err);
        div.innerHTML = '<p>Error al buscar juegos</p>';
    };
}