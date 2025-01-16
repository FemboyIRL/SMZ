const express = require("express");
const router = express.Router();
const db = require("../database/db");

// GET ALL PRODUCTS
router.get("/", async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  let startValue;
  let endValue;

  if (page > 0) {
    startValue = page * limit - limit; // 0,10,20,30
    endValue = page * limit;
  } else {
    startValue = 0;
    endValue = 10;
  }

  db.query(
    `SELECT p.id, p.title, p.image, p.price, p.short_desc, p.quantity,
        c.title as category FROM products p JOIN categories c ON
            c.id = p.cat_id LIMIT ${startValue}, ${limit}`,
    (err, results) => {
      if (err) console.log(err);
      else res.json(results);
    }
  );
});

// GET SINGLE PRODUCT BY ID
router.get("/:productId", async (req, res) => {
  const { productId } = req.params;
  db.query(
    `SELECT p.id, p.title, p.image, p.images, p.description, p.price, p.quantity, p.short_desc,
        c.title as category FROM products p JOIN categories c ON
            c.id = p.cat_id WHERE p.id = ${productId}`,
    (err, results) => {
      if (err) console.log(err);
      else res.json(results[0]);
    }
  );
});

// POST A PRODUCT
router.post("/", async (req, res) => {
  const { title, image, images, description, price, quantity, short_desc, cat_id } = req.body;

  // Validar que todos los campos obligatorios estén presentes
  if (!title || !image || !description || !price || !quantity || !short_desc || !cat_id) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Validar que 'images' sea un arreglo de imágenes en formato JSON
  let imagesArray = [];
  if (images) {
    if (Array.isArray(images)) {
      imagesArray = images;
    } else {
      return res.status(400).json({ error: "The 'images' field must be an array." });
    }
  }

  // Consulta SQL para insertar el producto
  const query = `
    INSERT INTO products (title, image, images, description, price, quantity, short_desc, cat_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // Ejecutar la consulta con los datos
  db.query(
    query,
    [title, image, JSON.stringify(imagesArray), description, price, quantity, short_desc, cat_id],  // Convertimos 'imagesArray' a JSON string
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error." });
      } else {
        return res.status(201).json({ message: "Product created successfully.", productId: result.insertId });
      }
    }
  );
});


// PUT A PRODUCT
router.put("/:productId", async (req, res) => {
  const { productId } = req.params;
  const { title, image, images, description, price, quantity, short_desc, cat_id } = req.body;

  // Validar que todos los campos obligatorios estén presentes
  if (!title || !image || !description || !price || !quantity || !short_desc || !cat_id) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Validar que 'images' sea un arreglo de imágenes
  let imagesArray = [];
  if (images) {
    if (Array.isArray(images)) {
      imagesArray = images;
    } else {
      return res.status(400).json({ error: "The 'images' field must be an array." });
    }
  }

  // Consulta SQL para actualizar el producto
  const query = `
    UPDATE products
    SET title = ?, image = ?, images = ?, description = ?, price = ?, quantity = ?, short_desc = ?, cat_id = ?
    WHERE id = ?
  `;

  // Ejecutar la consulta con los datos
  db.query(
    query,
    [title, image, JSON.stringify(imagesArray), description, price, quantity, short_desc, cat_id, productId],  // Convertimos 'imagesArray' a JSON string
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error." });
      } else if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Product not found." });
      } else {
        return res.json({ message: "Product updated successfully." });
      }
    }
  );
});


module.exports = router;
