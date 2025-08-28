const loadPerfil = async () => {
    try {
        const res = await fetch('api/perfil');
        const perfil = await res.json();

        document.getElementById("perfil").innerHTML = `
            <div class="col-12 col-md-6 col-lg-4 mx-auto">
                <div class="card text-center bg-dark text-white shadow">
                    <div class="card-body">
                        <img src="${perfil.avatar}" class="rounded-circle mb-3" style="width:120px; height:120px;" alt="${perfil.nombre}">
                        <h4 class="card-title">${perfil.nombre}</h4>
                        <p class="mb-2">
                            <span class="badge ${perfil.estado === 'En línea' ? 'bg-success' : 'bg-secondary'}">
                                ${perfil.estado}
                            </span>
                        </p>
                        <p class="card-text mb-1">Creado: ${perfil.creado}</p>
                        <p class="card-text mb-1">Última conexión: ${perfil.ultimaVisita}</p>
                        <a href="${perfil.perfilUrl}" target="_blank" class="btn btn-info btn-sm mt-2">Ver perfil en Steam</a>
                    </div>
                </div>
            </div>

        `;
    }
    catch(err) {
        console.error("Error cargando perfil:", err);
        document.getElementById("perfil").innerHTML = `
            <p class="text-danger">No se pudo cargar el perfil.</p>
        `;
    }
}


window.addEventListener("DOMContentLoaded", loadPerfil);