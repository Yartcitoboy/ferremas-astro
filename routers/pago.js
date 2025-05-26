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

router.post('/capture-paypal-order', async (req, res) => {
  try {
    const { orderID } = req.body;
    const captureData = await paypalService.captureOrder(orderID);
    // Aquí podrías actualizar tu base de datos con el estado de la orden capturada
    console.log('Captura exitosa:', captureData);
    res.json(captureData);
  } catch (error) {
    console.error("Error al capturar la orden:", error);
    res.status(500).json({ error: 'Failed to capture order' });
  }
});

module.exports = router;