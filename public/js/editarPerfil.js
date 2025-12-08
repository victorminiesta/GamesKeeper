async function loadUser() {
    const res = await fetch('/api/perfil/me');
    if (!res.ok) return console.error('Error al cargar datos del usuario');
    const user = await res.json()
    document.getElementById('usernameInput').value = user.username || '';
    document.getElementById('emailInput').value = user.email || '';
}

document.getElementById('updateForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('usernameInput').value.trim();
    const email = document.getElementById('emailInput').value.trim();
    const password = document.getElementById('passwordInput').value.trim();

    const payload = {};
    if (username) payload.username = username;
    if (email) payload.email = email;
    if (password) payload.password = password;

    const res = await fetch('/api/perfil/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const msgDiv = document.getElementById('msgDiv');
    if (res.ok) {
        msgDiv.innerHTML = '<div class="alert alert-success">Perfil actualizado correctamente</div>';
        document.getElementById('passwordInput').value = '';
    }
    else{
        const data = await res.json();
        msgDiv.innerHTML = `<div class="alert alert-danger">${data.error || 'Error al actualizar'}</div>`;
    }
});

window.onload = loadUser;