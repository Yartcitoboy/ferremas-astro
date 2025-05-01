// routes/product.js
import express from "express";
import oracledb from "oracledb";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

async function getConnection() {
    try {
        return await oracledb.getConnection({
            user: "ferre",
            password: "ferre",
            connectString: "localhost:1521/xe"
        });
    } catch (e) {
        console.error("Error al conectar con oracle:", e);
        throw new Error("Error al conectar con oracle");
    }
}

// Método GET para obtener productos
router.get("/", async (req, res) => {
    let cone;
    try {
        cone = await getConnection();
        const result = await cone.execute(
            `SELECT
                p.id_producto,
                p.codigo_producto,
                p.nombre,
                p.descripcion,
                p.precio,
                p.stock,
                p.imagen,
                p.marca,
                p.modelo,
                p.codigo,
                c.nombre AS categoria
            FROM
                producto p
            JOIN
                categoria c ON p.id_categoria = c.id_categoria`,
        );
        const productos = result.rows.map(row => ({
            id_producto: row[0],
            nombre: row[2],
            categoria: row[10],
            stock: row[5],
            precio: row[4]
        }));
        res.json(productos);
    } catch (ex) {
        res.status(500).json({ error: ex.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error("Error closing connection:", err);
            }
        }
    }
});

export default router;