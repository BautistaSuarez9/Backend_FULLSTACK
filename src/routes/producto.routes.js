const express = require('express');
const router = express.Router();
const Producto = require('../models/Producto');
const Reserva = require("../models/Reserva");

// Obtener todos los productos
router.get('/', async (req, res) => {
    console.log("🟢 Entró al endpoint GET /api/productos");
    try {
        const productos = await Producto.find();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener los productos' });
    }
});
router.get('/disponibles', async (req, res) => {
    try {
        const { fechaInicio, cantidadTurnos } = req.query;

        if (!fechaInicio || !cantidadTurnos) {
            return res.status(400).json({ mensaje: 'Se requiere fechaInicio y cantidadTurnos' });
        }

        const inicioNueva = new Date(fechaInicio);
        const finNueva = new Date(inicioNueva.getTime() + cantidadTurnos * 30 * 60000);

        // Traemos todas las reservas activas (pendientes y confirmadas)
        const reservas = await Reserva.find({
            estado: { $in: ['pendiente', 'confirmada'] }
        });

        // Armamos set de productos ocupados en el rango
        const productosOcupados = new Set();

        for (const reserva of reservas) {
            const inicioExistente = new Date(reserva.fechaInicio);
            const finExistente = new Date(inicioExistente.getTime() + reserva.cantidadTurnos * 30 * 60000);

            // Detectamos solapamiento de horarios
            if (inicioNueva < finExistente && finNueva > inicioExistente) {
                reserva.productos.forEach(p => productosOcupados.add(p.toString()));
            }
        }

        // Buscamos los productos que NO están ocupados
        const disponibles = await Producto.find({
            _id: { $nin: Array.from(productosOcupados) }
        });

        res.json(disponibles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al buscar productos disponibles', error });
    }
});

// Crear un nuevo producto
router.post('/', async (req, res) => {
    try {
        const nuevoProducto = new Producto(req.body);
        const productoGuardado = await nuevoProducto.save();
        res.status(201).json(productoGuardado);
    } catch (error) {
        res.status(400).json({ mensaje: 'Error al crear el producto', error });
    }
});

// Eliminar un producto por ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const productoEliminado = await Producto.findByIdAndDelete(id);
        if (!productoEliminado) {
            return res.status(404).json({ mensaje: 'Producto no encontrado' });
        }
        res.json({ mensaje: 'Producto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar el producto', error });
    }
});


module.exports = router;
