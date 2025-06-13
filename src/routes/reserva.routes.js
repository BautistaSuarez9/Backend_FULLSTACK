const express = require('express');
const router = express.Router();
const Reserva = require('../models/Reserva');
const Producto = require('../models/Producto');

// GET - todas las reservas
router.get('/', async (req, res) => {
    try {
        const reservas = await Reserva.find().populate('productos');
        res.json(reservas);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener las reservas', error });
    }
});

// POST - crear reserva
router.post('/', async (req, res) => {
    try {
        const { clienteNombre, productos, fechaInicio, cantidadTurnos, metodoPago, moneda, cantidadPersonas } = req.body;

        // Validar anticipación máxima de 48hs
        const ahora = new Date();
        const fechaTurno = new Date(fechaInicio);
        const diferenciaEnHoras = (fechaTurno - ahora) / (1000 * 60 * 60);

        if (diferenciaEnHoras > 48) {
            return res.status(400).json({ mensaje: 'No se puede reservar con más de 48 horas de anticipación' });
        }

        // Validaciones básicas
        if (cantidadTurnos < 1 || cantidadTurnos > 3) {
            return res.status(400).json({ mensaje: 'Máximo de 3 turnos permitidos' });
        }

        // Buscar productos
        const productosEncontrados = await Producto.find({ _id: { $in: productos } });

        if (productosEncontrados.length !== productos.length) {
            return res.status(404).json({ mensaje: 'Uno o más productos no existen' });
        }
        console.log("Cantidad personas recibida:", cantidadPersonas);

        for (const producto of productosEncontrados) {
            if (['jetsky', 'cuatriciclo'].includes(producto.tipo)) {
                if (cantidadPersonas > 2) {
                    return res.status(400).json({ mensaje: `No se pueden reservar más de 2 personas para el producto ${producto.nombre}` });
                }
            }
        }


        // Validar solapamiento de reservas existentes
        for (const productoId of productos) {
            const reservasExistentes = await Reserva.find({
                productos: productoId,
                estado: { $in: ['pendiente', 'confirmada'] }
            });

            for (const reserva of reservasExistentes) {
                const inicioExistente = new Date(reserva.fechaInicio);
                const finExistente = new Date(inicioExistente.getTime() + reserva.cantidadTurnos * 30 * 60000);

                const inicioNueva = new Date(fechaInicio);
                const finNueva = new Date(inicioNueva.getTime() + cantidadTurnos * 30 * 60000);

                if (inicioNueva < finExistente && finNueva > inicioExistente) {
                    return res.status(400).json({ mensaje: 'Uno o más productos ya están reservados en el horario solicitado.' });
                }
            }
        }



// Calcular fecha de fin de la nueva reserva
        const fechaInicioNueva = new Date(fechaInicio);
        const fechaFinNueva = new Date(fechaInicioNueva.getTime() + cantidadTurnos * 30 * 60000);

// Verificar si alguno de los productos ya está reservado en ese rango
        const conflicto = await Reserva.findOne({
            productos: { $in: productos },
            estado: { $in: ['pendiente', 'confirmada'] },
            fechaInicio: { $lt: fechaFinNueva }
        });

        if (conflicto) {
            const conflictoInicio = new Date(conflicto.fechaInicio);
            const conflictoFin = new Date(conflicto.fechaInicio.getTime() + conflicto.cantidadTurnos * 30 * 60000);

            if (fechaInicioNueva < conflictoFin) {
                return res.status(400).json({ mensaje: 'Uno o más productos ya están reservados en el horario solicitado' });
            }
        }




        // Calcular total en ARS
        let totalARS = 0;
        for (const producto of productosEncontrados) {
            totalARS += producto.precioPorTurno * cantidadTurnos;
        }

        // Aplicar descuento si hay más de un producto
        if (productos.length > 1) {
            totalARS = totalARS * 0.9;
        }

        // Calcular total en USD si aplica
        let totalUSD = undefined;
        if (moneda === 'USD') {
            const tasaCambio = 1300;
            totalUSD = parseFloat((totalARS / tasaCambio).toFixed(2));
        }

        const nuevaReserva = new Reserva({
            clienteNombre,
            productos,
            fechaInicio,
            cantidadTurnos,
            metodoPago,
            moneda,
            cantidadPersonas,  // NUEVO
            total: totalARS,
            totalUSD
        });


        const reservaGuardada = await nuevaReserva.save();
        res.status(201).json(reservaGuardada);
    }catch (error) {
        console.error(error); // para verlo en consola
        res.status(500).json({ mensaje: 'Error al crear la reserva', error: error.message });
    }

});



// Cancelar una reserva (solo si faltan más de 2 horas)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const reserva = await Reserva.findById(id);

        if (!reserva) {
            return res.status(404).json({ mensaje: 'Reserva no encontrada' });
        }

        const ahora = new Date();
        const diferenciaHoras = (reserva.fechaInicio - ahora) / (1000 * 60 * 60);

        if (diferenciaHoras < 2) {
            return res.status(400).json({ mensaje: 'No se puede cancelar la reserva con menos de 2 horas de anticipación' });
        }

        reserva.estado = 'cancelada';
        await reserva.save();

        res.json({ mensaje: 'Reserva cancelada exitosamente', reserva });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al cancelar la reserva', error });
    }
});

// Confirmar pago de una reserva (con validación de efectivo)
router.put('/pagar/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const reserva = await Reserva.findById(id);

        if (!reserva) {
            return res.status(404).json({ mensaje: 'Reserva no encontrada' });
        }

        if (reserva.estado === 'cancelada') {
            return res.status(400).json({ mensaje: 'No se puede pagar una reserva cancelada' });
        }

        if (reserva.metodoPago.toLowerCase().trim() === 'efectivo') {
            const ahora = new Date();
            const diferenciaHoras = (reserva.fechaInicio - ahora) / (1000 * 60 * 60);

            if (diferenciaHoras < 2) {
                reserva.estado = 'cancelada';
                await reserva.save();
                return res.status(400).json({ mensaje: 'No se pagó a tiempo. La reserva fue cancelada automáticamente.' });
            }
        }
        reserva.estado = 'confirmada';
        await reserva.save();

        res.json({ mensaje: 'Pago confirmado y reserva actualizada', reserva });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al confirmar el pago', error });
    }
});

// Finalizar una reserva (cuando se devuelve el producto)
router.put('/finalizar/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const reserva = await Reserva.findById(id);

        if (!reserva) {
            return res.status(404).json({ mensaje: 'Reserva no encontrada' });
        }

        if (reserva.estado !== 'confirmada') {
            return res.status(400).json({ mensaje: 'Solo se pueden finalizar reservas confirmadas' });
        }

        reserva.estado = 'finalizada';
        await reserva.save();

        res.json({ mensaje: 'Reserva finalizada exitosamente', reserva });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al finalizar la reserva', error: error.message });
    }
});



router.put('/tormenta/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const reserva = await Reserva.findById(id);

        if (!reserva) {
            return res.status(404).json({ mensaje: 'Reserva no encontrada' });
        }

        if (reserva.estado !== 'confirmada') {
            return res.status(400).json({ mensaje: 'Solo se puede aplicar el seguro a reservas confirmadas' });
        }

        const reembolso = reserva.moneda === 'USD'
            ? parseFloat((reserva.totalUSD / 2).toFixed(2))
            : reserva.total / 2;

        reserva.estado = 'reembolsada';
        reserva.reembolso = reembolso;
        await reserva.save();

        res.json({ mensaje: `Seguro aplicado. Se devuelve el 50% (${reembolso} ${reserva.moneda})`, reserva });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al aplicar seguro de tormenta', error });
    }

    router.get('/disponibles', async (req, res) => {
        try {
            const { fechaInicio, cantidadTurnos } = req.query;

            if (!fechaInicio || !cantidadTurnos) {
                return res.status(400).json({ mensaje: 'Se requiere fechaInicio y cantidadTurnos' });
            }

            const inicioNueva = new Date(fechaInicio);
            const finNueva = new Date(inicioNueva.getTime() + cantidadTurnos * 30 * 60000);

            const reservas = await Reserva.find({
                estado: { $in: ['pendiente', 'confirmada'] }
            });

            const productosOcupados = new Set();

            for (const reserva of reservas) {
                const inicioExistente = new Date(reserva.fechaInicio);
                const finExistente = new Date(inicioExistente.getTime() + reserva.cantidadTurnos * 30 * 60000);

                if (inicioNueva < finExistente && finNueva > inicioExistente) {
                    reserva.productos.forEach(p => productosOcupados.add(p.toString()));
                }
            }

            const disponibles = await Producto.find({
                _id: { $nin: Array.from(productosOcupados) }
            });

            res.json(disponibles);
        } catch (error) {
            res.status(500).json({ mensaje: 'Error al buscar productos disponibles', error });
        }
    });



});




module.exports = router;
