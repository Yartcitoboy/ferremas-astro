import paypal from '@paypal/checkout-server-sdk';

const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);
const client = new paypal.core.PayPalHttpClient(environment);

function calculateTotal(items) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

export async function createOrder(items) {
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: 'USD',
          value: calculateTotal(items).toFixed(2),
          breakdown: {
            item_total: {
              currency_code: 'USD',
              value: calculateTotal(items).toFixed(2),
            },
          },
        },
        items: items.map(item => ({
          name: item.name,
          unit_amount: {
            currency_code: 'USD',
            value: item.price.toFixed(2),
          },
          quantity: item.quantity,
        })),
      },
    ],
  });

  try {
    const order = await client.execute(request);
    return order.result;
  } catch (err) {
    console.error("Error al crear la orden de PayPal:", err);
    throw err;
  }
}

export async function captureOrder(orderID) {
  const request = new paypal.orders.OrdersCaptureRequest(orderID);
  request.requestBody = {};

  try {
    const capture = await client.execute(request);
    return capture.result;
  } catch (err) {
    console.error(`Error al capturar la orden ${orderID}:`, err);
    throw err;
  }
}