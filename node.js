// index.js
import express from "express";
import productRoutes from "./routes/product.js"; 
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 6500; // aca cambias el puerto al que quieras

app.use("/product", productRoutes); // aqui le agregas la ruta a la que quieres acceder, en este caso /product

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});