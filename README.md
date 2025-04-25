# Backend TP - Alquiler de Productos de Playa

Sistema desarrollado por Bautista Suárez como parte del Trabajo Práctico de Full Stack.  
Permite gestionar el alquiler de productos para un parador en el Caribe: reservas, pagos, cancelaciones, y devoluciones.

---

## ⚙️ Tecnologías utilizadas

- Node.js + Express.js
- MongoDB Atlas + Mongoose
- Postman para pruebas
- Git y GitHub
- WebStorm como entorno de desarrollo

---

## Funcionalidades implementadas

- Gestión de productos
- Gestión de reservas
- Validaciones de negocio:
  - Reservas con máximo de 3 turnos consecutivos
  - Anticipación máxima de 48 horas
  - Cancelación sin costo hasta 2 horas antes
  - Pago en efectivo o transferencia
  - Control de solapamiento de reservas (no se puede reservar un producto ya ocupado)
  - Moneda local (ARS) o dólares (USD)
  - Descuento del 10% en el total si se reservan múltiples productos
  - Seguro de tormenta (reintegro del 50% en caso de mal clima)
  - Finalización de reservas al devolver los productos

---

## Endpoints principales

### Productos
| Método | Ruta                  | Descripción                  |
|--------|------------------------|-------------------------------|
| GET    | `/api/productos`        | Listar productos              |
| POST   | `/api/productos`        | Crear producto nuevo          |

### Reservas
| Método | Ruta                         | Descripción                    |
|--------|-------------------------------|---------------------------------|
| GET    | `/api/reservas`               | Listar todas las reservas       |
| POST   | `/api/reservas`               | Crear nueva reserva             |
| PUT    | `/api/reservas/pagar/:id`     | Confirmar pago de una reserva   |
| PUT    | `/api/reservas/finalizar/:id` | Finalizar una reserva (devolución) |
| PUT    | `/api/reservas/tormenta/:id`  | Aplicar seguro de tormenta      |
| DELETE | `/api/reservas/:id`           | Cancelar una reserva            |

---


