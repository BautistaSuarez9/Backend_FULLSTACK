const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema({
    clienteNombre: {
        type: String,
        required: true
    },
    productos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Producto',
        required: true
    }],
    fechaInicio: {
        type: Date,
        required: true
    },
    cantidadTurnos: {
        type: Number,
        required: true,
        min: 1,
        max: 3
    },
    total: {
        type: Number,
        required: true
    },
    estado: {
        type: String,
        enum: ['pendiente', 'confirmada', 'cancelada'],
        default: 'pendiente'
    },
    metodoPago: {
        type: String,
        enum: ['efectivo', 'transferencia'],
        default: 'efectivo'
    },
    moneda: {
        type: String,
        enum: ['ARS', 'USD'],
        default: 'ARS'
    },
    totalUSD: {
        type: Number
    },
    estado: {
        type: String,
        enum: ['pendiente', 'confirmada', 'cancelada', 'reembolsada'],
        default: 'pendiente'
    },
    reembolso: Number

});

module.exports = mongoose.model('Reserva', reservaSchema);
