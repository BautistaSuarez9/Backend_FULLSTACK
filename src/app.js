const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const productoRoutes = require('./routes/producto.routes');
const reservaRoutes = require('./routes/reserva.routes');



const app = express();
app.use(express.json());
app.use('/api/productos', productoRoutes);
app.use('/api/reservas', reservaRoutes);



const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Conectado a MongoDB Atlas'))
    .catch((err) => console.error('❌ Error al conectar a MongoDB:', err));

app.get('/', (req, res) => {
    res.send('¡Servidor funcionando!');
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
