import express from 'express';

const router = express.Router();

const perfilApiUrl = process.env.PERFIL_API_URL;

router.get('/', async (req, res) => {
    try {
        const response = await fetch(perfilApiUrl);
        const data = await response.json();
        const perfil = data.response.players[0];

        res.json({
            nombre: perfil.personaname,
            avatar: perfil.avatarfull,
            perfilUrl: perfil.profileurl,
            estado: (perfil.personastate === 1) ? '🟢 En línea' : '🔴 Desconectado',
            creado: perfil.timecreated ? new Date(perfil.timecreated * 1000).toLocaleDateString("es-ES") : 'Desconocido',
            ultimaVisita: perfil.lastlogoff ? new Date(perfil.lastlogoff * 1000).toLocaleDateString("es-ES") : 'Desconocido',
        });
    }
    catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ error: 'Error interno al obtener perfil' });
    }
});

export default router;