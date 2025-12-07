// Cargar datos del usuario

async function cargarUsuarios() {
    try {
        const res = await fetch('/api/perfil/me');
        const data = await res.json();
        if (data.username) {
            document.getElementById('usernameText').textContent = data.username;
        }
    } catch (err) {
        console.error('Error al cargar datos del usuario:', err);
    }
}

cargarUsuarios();

// Logout

const logoutBtn = document.getElementById('logoutBtn');
logoutBtn.addEventListener('click', async () => {
    const res = await fetch("/auth/logout", { method: 'POST' });

    if (res.ok) {
        localStorage.clear();
        window.location.href = '/bienvenida';
    }
    else{
        alert('Error al cerrar sesión.');
    }
});