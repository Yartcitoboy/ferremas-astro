// routers/paypal-routes.js (ejemplo)
import express from "express";
import { getConnection } from "../src/lib/index.js";
import * as paypalService from "../src/lib/paypal.js";
const router = express.Router();

router.post("/create-paypal-order", async (req, res) => {
  try {
    const { items } = req.body;
    const order = await paypalService.createOrder(items);
    res.json({ id: order.id });
  } catch (error) {
    console.error("Error en /capture-paypal-order:", error);
    res.status(500).json({ error: "Error interno en /capture-paypal-order" });
  }
});

// En tu ruta /api/capture-paypal-order
router.post("/capture-paypal-order", async (req, res) => {
  try {
    const { orderID, items, direccion_envio, userId, total } = req.body;
    console.log("===> Recibida petición a /capture-paypal-order");
    console.log("Datos recibidos:", req.body);

    // 1. Crea el pedido
    const pedidoResult = await fetch("http://localhost:6500/pedidos-usuario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_usuario: userId,
        items,
        direccion_envio,
        total,
      }),
    });
    const pedidoData = await pedidoResult.json();
    console.log("Pedido creado:", pedidoData);

    if (!pedidoData.id_pedido) {
      console.error("No se recibió id_pedido, no se puede crear el pago.");
      return res.status(500).json({ error: "No se pudo obtener el id del pedido" });
    }

    // 2. Registra el pago en la base de datos
    const cone = await getConnection();
    await cone.execute(
      `INSERT INTO pago (id_pago, id_pedido, metodo_pago, fecha_pago, monto, estado)
       VALUES (seq_pago.NEXTVAL, :id_pedido, :metodo_pago, SYSDATE, :monto, 'Pendiente')`,
      [
        pedidoData.id_pedido,
        "PayPal",
        total,
      ]
    );
    await cone.commit();
    await cone.close();

    return res.json({ message: "Pedido y pago creados correctamente" });
  } catch (error) {
    console.error("Error en /capture-paypal-order:", error);
    res.status(500).json({ error: "Error interno en /capture-paypal-order" });
  }
});

// GET /pago/pendientes
router.get("/pago/pendientes", async (req, res) => {
  const cone = await getConnection();
  try {
    const result = await cone.execute(
      `SELECT id_pago, id_pedido, metodo_pago, TO_CHAR(fecha_pago, 'DD/MM/YYYY') as fecha_pago, monto, estado
       FROM pago
       WHERE estado = 'Pendiente'
       ORDER BY fecha_pago DESC`,
    );
    res.json({
      pagos: result.rows.map((row) => ({
        id_pago: row[0],
        id_pedido: row[1],
        metodo_pago: row[2],
        fecha_pago: row[3],
        monto: row[4],
        estado: row[5],
      })),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    await cone.close();
  }
});

// POST /pago/:id_pago/confirmar
router.post("/pago/:id/confirmar", async (req, res) => {
  const cone = await getConnection();
  try {
    const id_pago = req.params.id;
    // 1. Cambia el estado del pago
    await cone.execute(
      `UPDATE pago SET estado = 'Confirmado' WHERE id_pago = :id_pago`,
      [id_pago]
    );
    // 2. Busca el id_pedido relacionado
    const result = await cone.execute(
      `SELECT id_pedido FROM pago WHERE id_pago = :id_pago`,
      [id_pago]
    );
    const id_pedido = result.rows[0][0];
    // 3. Cambia el estado del pedido
    await cone.execute(
      `UPDATE pedido SET estado = 'Preparando' WHERE id_pedido = :id_pedido`,
      [id_pedido]
    );
    await cone.commit();
    res.json({ message: "Pago confirmado y pedido enviado a bodega" });
  } catch (e) {
    await cone.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    await cone.close();
  }
});

export default router;
