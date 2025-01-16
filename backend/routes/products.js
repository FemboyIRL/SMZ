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

  if (!title || !image || !description || !price || !quantity || !short_desc || !cat_id) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const query = `
    INSERT INTO products (title, image, images, description, price, quantity, short_desc, cat_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [title, image, images, description, price, quantity, short_desc, cat_id],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Database error." });
      } else {
        res.status(201).json({ message: "Product created successfully.", productId: result.insertId });
      }
    }
  );
});

// PUT A PRODUCT
router.put("/:productId", async (req, res) => {
  const { productId } = req.params;
  const { title, image, images, description, price, quantity, short_desc, cat_id } = req.body;

  if (!title || !image || !description || !price || !quantity || !short_desc || !cat_id) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const query = `
    UPDATE products
    SET title = ?, image = ?, images = ?, description = ?, price = ?, quantity = ?, short_desc = ?, cat_id = ?
    WHERE id = ?
  `;

  db.query(
    query,
    [title, image, images, description, price, quantity, short_desc, cat_id, productId],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Database error." });
      } else if (result.affectedRows === 0) {
        res.status(404).json({ error: "Product not found." });
      } else {
        res.json({ message: "Product updated successfully." });
      }
    }
  );
});


module.exports = router;
