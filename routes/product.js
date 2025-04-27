// routes/product.js
import express from "express";
import oracledb from "oracledb";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

async function getConnection() {
    try {
        return await oracledb.getConnection({
            user: "issa",
            password: "issa",
            connectString: "localhost:1521/xe"
        });
    } catch (e) {
        console.error("Error al conectar con oracle:", e);
        throw new Error("Error al conectar con oracle");
    }
}

// Metodo get para obtener productos:
router.get("/", async (req, res) => { // Cambiamos la ruta a "/" ya que se montará en "/product" en la app principal
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute("SELECT * FROM PRODUCTO");
        const rows = result.rows || [];
        const lista = rows.map(row => ({
            id: row[0],
            nombre: row[1],
            precio: row[2],
            stock: row[3],
            categoria: row[4],
        }));
        res.json(lista);
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ error: "Error al obtener productos" });
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