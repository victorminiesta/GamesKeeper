async function añadirJuego(appid) {
    const res = await fetch(`/api/games/${appid}`, {
        method: 'POST',
    });
    if (res.ok) {
        alert('Juego añadido a favoritos');
    } else {
        alert('Error al añadir el juego');
    }
}

async function buscarJuegos() {
    const query = document.getElementById('searchInput').value.trim();
    const div = document.getElementById('results');

    if (!query) {
        div.innerHTML = '<p>Escribe algo para buscar</p>';
        return;
    }

    div.innerHTML = '<p>Buscando.</p>';
    div.innerHTML = '<p>Buscando..</p>';
    div.innerHTML = '<p>Buscando...</p>';

    try {
        const res = await fetch(`/api/games/buscar?q=${encodeURIComponent(query)}`);
        const juegos = await res.json();

        if (juegos.length === 0) {
            div.innerHTML = '<p>No se encontraron juegos</p>';
            return;
        }

        div.innerHTML = juegos.map(juego => 
            `<div class="game-card">
                <h3>${juego.name}</h3>
                <button onclick='añadirJuego(${juego.appid})'>Añadir</button>
            </div>`
        ).join('');
    }
    catch (err) {
        console.error('Error al buscar juegos: ', err);
        div.innerHTML = '<p>Error al buscar juegos</p>';
    };
}