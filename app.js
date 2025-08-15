require('dotenv').config();
const express = require('express');
const cors = require('cors');
const games = require('./routes/games');


const app = express();
app.use(express.static('public'));
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use('/api/games', games);

app.get('/buscar', (req, res) => {
  res.sendFile(__dirname + '/public/buscar.html');
});


app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
