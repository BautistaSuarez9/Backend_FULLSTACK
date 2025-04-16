const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    tipo: {
        type: String,
        enum: ['jetsky', 'cuatriciclo', 'buceo', 'tabla_niño', 'tabla_adulto'],
        required: true
    },
    dispositivosRequeridos: {
        type: [String], // Ej: ['casco', 'chaleco']
        default: []
    },
    aptoNinios: {
        type: Boolean,
        default: false
    },
    precioPorTurno: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Producto', productoSchema);
