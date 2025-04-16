# Backend TP - Alquiler de Productos de Playa

Este backend fue desarrollado por Bautista Leon Suarez, como parte del Trabajo Práctico de la materia Full Stack.  
El sistema permite gestionar el alquiler de productos para un parador: desde la carga de productos hasta la reserva, pago y cancelación.

---

Tecnologías utilizadas

- Node.js + Express.js (servidor y rutas REST)
- MongoDB Atlas + Mongoose (persistencia)
- Postman (para pruebas de API)
- Git y GitHub
- WebStorm como entorno de desarrollo

---

Funcionalidades implementadas

- Gestión de productos (alta con dispositivos requeridos, apto para niños, etc.)
- Reservas con duración de 30 minutos por turno (hasta 3 turnos consecutivos)
- Validaciones:
  - Máximo 48hs de anticipación
  - Cancelación hasta 2 horas antes
  - Restricción para pagar en efectivo fuera de tiempo
- Métodos de pago: efectivo o transferencia
- Moneda: ARS o USD, con conversión automática ($1300 = 1 USD)
- Descuento del 10% al reservar más de un producto
- Seguro de tormenta: si no se puede disfrutar el turno, se reembolsa el 50%
- Manejo de estados: `pendiente`, `confirmada`, `cancelada`, `reembolsada`

---

Rutas principales

### Productos
- `GET /api/productos` – Listar productos
- `POST /api/productos` – Crear producto nuevo

### Reservas
- `POST /api/reservas` – Crear una reserva
- `GET /api/reservas` – Listar todas las reservas
- `PUT /api/reservas/pagar/:id` – Confirmar pago
- `DELETE /api/reservas/:id` – Cancelar una reserva
- `PUT /api/reservas/tormenta/:id` – Aplicar seguro de tormenta


