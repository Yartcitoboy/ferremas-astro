import express from "express";
import { getConnection } from "../src/lib/index.js"; 

const app = express();
const router = express.Router();

app.use(express.json());


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
                    usuario u ON p.id_usuario_vendedor = u.id_usuario`
        );
        const pedidos = result.rows.map(row => ({
            id_pedido: row[0],
            cliente: row[1],
            fecha: row[2],
            estado: row[3],
            vendedor: row[4],
            total: row[7], // El total ahora está en la octava columna (índice 7)
        }));
        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (cone) await cone.close();
    }
});

// Ruta para aprobar un pedido
router.post("/:id_pedido/aprobar", async (req, res) => {
    const { id_pedido } = req.params;
    let cone;
    try {
        cone = await getConnection();
        const result = await cone.execute(
            `UPDATE pedido SET estado = 'Aprobado' WHERE id_pedido = :id`,
            [id_pedido]
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

// Ruta para eliminar un pedido
router.delete("/:id_pedido", async (req, res) => {
    const { id_pedido } = req.params;
    let cone;
    try {
        cone = await getConnection();
        const result = await cone.execute(
            "DELETE FROM pedido WHERE id_pedido = :id_pedido",
            [id_pedido]
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

// Ruta para rechazar un pedido
router.post("/:id_pedido/rechazar", async (req, res) => {
    const { id_pedido } = req.params;
    let cone;
    try {
        cone = await getConnection();
        const result = await cone.execute(
            `UPDATE pedido SET estado = 'Rechazado' WHERE id_pedido = :id`,
            [id_pedido]
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

export default router;