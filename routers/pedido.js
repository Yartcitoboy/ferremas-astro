import express from "express";
import { getConnection } from "../src/lib/index.js";
import oracledb from "oracledb";

const router = express.Router();

// ¡Asegúrate de tener esto en tu archivo principal!
// app.use(express.json());

router.get("/", async (req, res) => {
  let cone;
  try {
    cone = await getConnection();
    const result = await cone.execute(`SELECT
                    p.id_pedido,
                    u.nombre_apellidos AS usuario,
                    TO_CHAR(p.fecha_pedido, 'DD/MM/YYYY') AS fecha,
                    p.estado,
                    u.nombre_apellidos AS vendedor,
                    p.fecha_entrega,
                    p.direccion_envio,
                    p.total
                FROM
                    pedido p
                JOIN
                    usuario u ON p.id_usuario_vendedor = u.id_usuario`);
    const pedidos = result.rows.map((row) => ({
      id_pedido: row[0],
      cliente: row[1],
      fecha: row[2],
      estado: row[3],
      vendedor: row[4],
      total: row[7],
    }));
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (cone) await cone.close();
  }
});

// Aprobar pedido
router.post("/:id_pedido/aprobar", async (req, res) => {
  const { id_pedido } = req.params;
  let cone;
  try {
    cone = await getConnection();
    const result = await cone.execute(
      `UPDATE pedido SET estado = 'Aprobado' WHERE id_pedido = :id`,
      [id_pedido],
    );
    await cone.commit();
    if (result.rowsAffected > 0) {
      res.json({ message: `Pedido ${id_pedido} aprobado` });
    } else {
      res.status(404).json({ error: `Pedido ${id_pedido} no encontrado` });
    }
  } catch (error) {
    await cone.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    if (cone) await cone.close();
  }
});

// Eliminar pedido
router.delete("/:id_pedido", async (req, res) => {
  const { id_pedido } = req.params;
  let cone;
  try {
    cone = await getConnection();
    const result = await cone.execute(
      "DELETE FROM pedido WHERE id_pedido = :id_pedido",
      [id_pedido],
    );
    await cone.commit();
    if (result.rowsAffected > 0) {
      res.json({ mensaje: "Pedido eliminado con éxito" });
    } else {
      res.status(404).json({ error: "Pedido no encontrado" });
    }
  } catch (error) {
    await cone.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    if (cone) await cone.close();
  }
});

// Rechazar pedido
router.post("/:id_pedido/rechazar", async (req, res) => {
  const { id_pedido } = req.params;
  let cone;
  try {
    cone = await getConnection();
    const result = await cone.execute(
      `UPDATE pedido SET estado = 'Rechazado' WHERE id_pedido = :id`,
      [id_pedido],
    );
    await cone.commit();
    if (result.rowsAffected > 0) {
      res.json({ message: `Pedido ${id_pedido} rechazado` });
    } else {
      res.status(404).json({ error: `Pedido ${id_pedido} no encontrado` });
    }
  } catch (error) {
    await cone.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    if (cone) await cone.close();
  }
});

// Crear pedido y detalles --------------------------------------------------------------------------------
router.post("/pedidos-usuario", async (req, res) => {
  console.log("POST /pedidos-usuario", req.body);
  let cone;
  try {
    cone = await getConnection();
    const { id_usuario, items, direccion_envio, total } = req.body;

    // 1. Crear el pedido
    const pedidoResult = await cone.execute(
      `INSERT INTO pedido (id_usuario, direccion_envio, total) VALUES (:id_usuario, :direccion_envio, :total) RETURNING id_pedido INTO :id_pedido_out`,
      {
        id_usuario,
        direccion_envio,
        total,
        id_pedido_out: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );
    const id_pedido = pedidoResult.outBinds.id_pedido_out[0];

    // 2. Insertar los detalles del pedido
    for (const item of items) {
      await cone.execute(
        `INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio, subtotal) 
         VALUES (:id_pedido, :id_producto, :cantidad, :precio, :subtotal)`,
        [
          id_pedido,
          item.id_producto,
          item.cantidad,
          item.precio_unitario,
          item.cantidad * item.precio_unitario,
        ],
      );
      // Opcional: Actualizar el stock del producto
      await cone.execute(
        `UPDATE producto SET stock = stock - :cantidad WHERE id_producto = :id_producto`,
        [item.cantidad, item.id_producto],
      );
    }

    await cone.commit();
    res.status(201).json({ message: "Pedido creado exitosamente", id_pedido });
  } catch (error) {
    if (cone) await cone.rollback();
    console.error("Error al crear el pedido en la base de datos:", error);
    res.status(500).json({ error: error.message });
  } finally {
    if (cone) await cone.close();
  }
});

// Historial de pedidos de usuario (con detalles)
router.get("/pedidos-usuario/:id_usuario", async (req, res) => {
  const { id_usuario } = req.params;
  let cone;
  try {
    cone = await getConnection();
    const pedidosResult = await cone.execute(
      `SELECT
        p.id_pedido,
        TO_CHAR(p.fecha_pedido, 'DD/MM/YYYY') AS fecha_pedido,
        TO_CHAR(p.fecha_entrega, 'DD/MM/YYYY') AS fecha_entrega,
        p.estado,
        p.direccion_envio,
        p.total
      FROM pedido p
      WHERE p.id_usuario = :id_usuario
      ORDER BY p.fecha_pedido DESC`,
      [id_usuario],
    );
    const pedidos = [];
    for (const row of pedidosResult.rows) {
      const [id_pedido, fecha, fecha_entrega, estado, direccion_envio, total] = row;
      const detallesResult = await cone.execute(
        `SELECT
          dp.id_producto,
          pr.nombre,
          pr.imagen,
          dp.cantidad,
          dp.precio,
          dp.subtotal
        FROM detalle_pedido dp
        JOIN producto pr ON dp.id_producto = pr.id_producto
        WHERE dp.id_pedido = :id_pedido`,
        [id_pedido],
      );
      const detalles = detallesResult.rows.map((det) => ({
        id_producto: det[0],
        nombre: det[1],
        imagen: det[2],
        cantidad: det[3],
        precio: det[4],
        subtotal: det[5],
      }));
      pedidos.push({
        id_pedido,
        fecha,
        fecha_entrega,
        estado,
        direccion_envio,
        total,
        detalles,
      });
    }
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (cone) await cone.close();
  }
});

//BODEGUERO

router.get("/pedidos/preparar", async (req, res) => {
  const cone = await getConnection();
  try {
    const result = await cone.execute(
      `SELECT id_pedido, id_usuario, estado
       FROM pedido
       WHERE estado = 'Preparando'
       ORDER BY id_pedido DESC`
    );
    res.json({
      pedidos: result.rows.map(row => ({
        id_pedido: row[0],
        id_usuario: row[1],
        estado: row[2],
      })),
    });
  } catch (e) {
    res.status(500).json({ pedidos: [] }); // <-- Corrige aquí también
  } finally {
    await cone.close();
  }
});

router.post("/pedido/:id/listo", async (req, res) => {
  const cone = await getConnection();
  try {
    const id_pedido = req.params.id;
    await cone.execute(
      `UPDATE pedido SET estado = 'Listo para entrega' WHERE id_pedido = :id_pedido`,
      [id_pedido]
    );
    await cone.commit();
    res.json({ message: "Pedido listo para entrega" });
  } catch (e) {
    await cone.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    await cone.close();
  }
});

router.get("/despacho", async (req, res) => {
  const cone = await getConnection();
  try {
    const result = await cone.execute(
      `SELECT id_pedido, id_usuario, fecha_entrega, direccion_envio, estado
       FROM pedido
       WHERE estado = 'Listo para entrega'
       ORDER BY fecha_pedido DESC`
    );
    res.json(
      result.rows.map(row => ({
        id_pedido: row[0],
        id_usuario: row[1],
        fecha_entrega: row[2],
        direccion_envio: row[3],
        estado: row[4],
      }))
    );
  } catch (e) {
    res.status(500).json([]);
  } finally {
    await cone.close();
  }
});

// VENDEDOR

router.patch("/despacho/:id", async (req, res) => {
  const cone = await getConnection();
  try {
    const id_pedido = req.params.id;
    const { fecha_entrega, direccion_envio, estado } = req.body;
    console.log("PATCH /despacho/:id", { id_pedido, fecha_entrega, direccion_envio, estado }); // <-- LOG
    const campos = [];
    const valores = [];

    if (fecha_entrega) {
      campos.push("fecha_entrega = TO_DATE(:fecha_entrega, 'yyyy-mm-dd')");
      valores.push(fecha_entrega);
    }
    if (direccion_envio) {
      campos.push("direccion_envio = :direccion_envio");
      valores.push(direccion_envio);
    }
    if (estado) {
      campos.push("estado = :estado");
      valores.push(estado);
    }
    valores.push(id_pedido);

    if (campos.length === 0) {
      console.log("No hay campos para actualizar"); // <-- LOG
      return res.status(400).json({ error: "No hay campos para actualizar" });
    }

    console.log("Campos a actualizar:", campos, "Valores:", valores); // <-- LOG

    await cone.execute(
      `UPDATE pedido SET ${campos.join(", ")} WHERE id_pedido = :id_pedido`,
      valores
    );
    await cone.commit();
    res.json({ message: "Pedido actualizado" });
  } catch (e) {
    await cone.rollback();
    console.error("Error en PATCH /despacho/:id:", e); // <-- LOG
    res.status(500).json({ error: e.message });
  } finally {
    await cone.close();
  }
});

export default router;