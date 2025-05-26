// routes/product.js
import express from "express";
import { getConnection } from "../src/lib/index.js"; 
import dotenv from "dotenv";

dotenv.config();
const app = express();
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

app.use(express.json());

// Método GET para obtener productos
router.get("/" ,async (req, res) => {
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
            categoria: row[9],
            stock: row[5],
            precio: row[4],
            imagen: row[6],
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

// Ruta para obtener un producto por ID
// Ruta para obtener un producto por ID
router.get("/:id_producto", async (req, res) => {
  let cone;
  const id_producto = req.params.id_producto;

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
        p.codigo,
        c.nombre AS categoria
      FROM
        producto p
      JOIN
        categoria c ON p.id_categoria = c.id_categoria
      WHERE p.id_producto = :id_producto`,
      [id_producto],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const row = result.rows[0];
    const productoPlano = {
      id_producto: row[0],
      codigo_producto: row[1],
      nombre: row[2],
      descripcion: row[3],
      precio: row[4],
      stock: row[5],
      imagen: row[6],
      marca: row[7],
      codigo: row[8],
      categoria: row[9]
    };
    res.json(productoPlano);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (cone) await cone.close();
  }
});

export default router;