const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const productoRoutes = require('./routes/producto.routes');
const reservaRoutes = require('./routes/reserva.routes');

const app = express();

// REGISTRAMOS PRIMERO EL CORS
app.use(cors());

// LUEGO EL JSON PARSER
app.use(express.json());

// LUEGO LAS RUTAS
app.use('/api/productos', productoRoutes);
app.use('/api/reservas', reservaRoutes);

// TEST RÁPIDO DE QUE EL SERVIDOR FUNCIONA
app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente');
});

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Conectado a MongoDB Atlas'))
    .catch((err) => console.error('❌ Error al conectar a MongoDB:', err));

app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
