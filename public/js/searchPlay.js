document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    
    // Buscar al presionar Enter
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            buscarJuego();
        }
    });
})

async function buscarJuego() {
    const query = document.getElementById('searchInput').value.trim();
    const region = "ES";
    const div = document.getElementById('results');

    if (!query) {
        div.innerHTML = '<div class="alert alert-warning">✍️ Escribe el nombre de un juego para buscar</div>';
        return;
    }

    div.innerHTML = '<div class="alert alert-info">🔍 Buscando en PlayStation Store...</div>';

    try {
        const res = await fetch(`/api/play/buscar?q=${encodeURIComponent(query)}&region=${region}`);
        
        if (!res.ok) {
            const error = await res.json();
            div.innerHTML = `<div class="alert alert-danger">❌ ${error.error || 'Juego no encontrado'}</div>`;
            return;
        }

        const juego = await res.json();
        
        div.innerHTML = `
            <div class="card shadow">
                <div class="row g-0">
                    <div class="col-md-4">
                        <img src="${juego.image}" class="img-fluid rounded-start" alt="${juego.name}">
                    </div>
                    <div class="col-md-8">
                        <div class="card-body">
                            <h3 class="card-title">${juego.name}</h3>
                            <span class="badge bg-${juego.platform === 'ps5' ? 'primary' : 'info'} mb-2">
                                ${juego.platform.toUpperCase()}
                            </span>
                            
                            <p class="card-text">${juego.description || 'Sin descripción disponible'}</p>
                            
                            <div class="d-flex align-items-center gap-3 mb-3">
                                <h4 class="mb-0 text-success">${juego.price}</h4>
                                ${juego.discount > 0 ? `<span class="badge bg-danger">🔥 -${juego.discount}% OFERTA</span>` : ''}
                            </div>

                            ${juego.isAdded 
                                ? '<button class="btn btn-secondary" disabled>✅ Ya está en tu lista</button>'
                                : `<button class="btn btn-success btn-lg" onclick="añadirJuego('${juego.ppid}', '${region}')">➕ Añadir a mi lista</button>`
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (err) {
        console.error('Error al buscar juego:', err);
        div.innerHTML = '<div class="alert alert-danger">❌ Error al buscar el juego. Inténtalo de nuevo.</div>';
    }
}