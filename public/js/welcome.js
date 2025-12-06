document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const messageBox = document.getElementById('messageBox');

    // --- Función para mostrar mensajes ---
    function showMessage(text, type = 'danger') {
        messageBox.innerHTML = `<div class="alert alert-${type}" role="alert">${text}</div>`;
    }

    // --- LOGIN ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = loginForm.email.value.trim();
        const password = loginForm.password.value.trim();

        try {
            const res = await fetch('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
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

    // --- REGISTRO (opcional) ---
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = registerForm.username.value.trim();
            const email = registerForm.email.value.trim();
            const password = registerForm.password.value.trim();

            try {
                const res = await fetch('/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password })
                });

                const data = await res.json();

                if (res.ok) {
                    showMessage('Registro correcto, ya puedes iniciar sesión.', 'success');
                    registerForm.reset();
                } else {
                    showMessage(data.error || 'Error en el registro.');
                }
            } catch (err) {
                console.error(err);
                showMessage('Error en la conexión con el servidor.');
            }
        });
    }
});
