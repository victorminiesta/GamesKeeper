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