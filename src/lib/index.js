// index.js
import express from "express";
import productRoutes from "../../routers/product.js"; 
import dotenv from "dotenv"; // Asegúrate de que la ruta sea correcta
import oracledb from "oracledb"; // Asegúrate de que la ruta sea correcta


dotenv.config();

const app = express();
const port = process.env.PORT || 3000; // aca cambias el puerto al que quieras

// Base de datos Oracle
async function getConnection() {
    try {
        return await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,  
            connectString: process.env.DB_CONNECTION_STRING,
        });
    } catch (e) {
        console.error("Error al conectar con oracle:", e);
        throw new Error("Error al conectar con oracle");
    }
}
export { getConnection }; 

// aqui le agregas la ruta a la que quieres acceder, en este caso /product
app.use("/product", productRoutes); 

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});