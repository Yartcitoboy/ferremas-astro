// routers/paypal-routes.js (ejemplo)
const express = require('express');
const router = express.Router();
const paypalService = require('../src/lib/paypal');

router.post('/create-paypal-order', async (req, res) => {
  try {
    const { items } = req.body;
    const order = await paypalService.createOrder(items);
    res.json({ id: order.id });
  } catch (error) {
    console.error("Error al crear la orden:", error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// En tu ruta /api/capture-paypal-order
router.post('/capture-paypal-order', async (req, res) => {
  try {
    const { orderID, items, direccion_envio, userId } = req.body; // Asumiendo que recibes estos datos
    const captureData = await paypalService.captureOrder(orderID);
    console.log('Captura exitosa:', captureData);

    // Llamada a la API para crear el pedido
    try {
      const pedidoResult = await fetch('/pedido', { // La ruta de tu API de pedidos
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, items, direccion_envio, total: captureData.purchase_units[0].amount.value })
      });
      const pedidoData = await pedidoResult.json();
      console.log('Pedido creado:', pedidoData);
      // Redirigir al usuario a la página de gracias
      return res.json({ ...captureData, redirectUrl: '/tranks/gracias-por-tu-compra' });
    } catch (error) {
      console.error("Error al crear el pedido:", error);
      return res.status(500).json({ error: 'Failed to create order in database' });
    }

  } catch (error) {
    console.error("Error al capturar la orden:", error);
    res.status(500).json({ error: 'Failed to capture order' });
  }
});

module.exports = router;