// routes/product.js
import express from "express";
import { getConnection } from "../src/lib/index.js"; // Asegúrate de que la ruta sea correcta
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const API_KEY = process.env.API_KEY;


// Middleware para validar la API KEY
function validarApiKey(req, res, next){
    const apiKey = req.headers['x-api-key']
    if(!apiKey || apiKey !== API_KEY){
        return res.status(401).json({error: "API KEY incorrecta o no entregada"})
    }
    next()
}

// Método GET para obtener productos
router.get("/" ,validarApiKey,async (req, res) => {
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
        if (cone) {
            try {
                await cone.close();
            } catch (err) {
                console.error("Error al cerrar la conexión:", err);
            }
        }
    }
});

export default router;