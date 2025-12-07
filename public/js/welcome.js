document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const messageBox = document.getElementById('messageBox');

    // --- Función para mostrar mensajes ---
    function showMessage(text, type = 'danger') {
        messageBox.innerHTML = `<div class="alert alert-${type}" role="alert">${text}</div>`;
    }

    // --- LOGIN ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = loginForm.username.value.trim();
        const password = loginForm.password.value.trim();

        try {
            const res = await fetch('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (res.ok) {
                // Login correcto → redirigir al /
                window.location.href = '/';
            } else {
                showMessage(data.error || 'Error en el login.');
            }
        } catch (err) {
            console.error(err);
            showMessage('Error en la conexión con el servidor.');
        }
    });
});
