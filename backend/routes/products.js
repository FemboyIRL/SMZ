const express = require("express");
const router = express.Router();
const db = require("../database/db");
const multerUpload = require("../multer")
const productController = require("../controllers/productsController")

router.get("/category/:categoryId", productController.getAllProductsFromCategory);

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
router.post("/", multerUpload.fields([{ name: "image" }, { name: "images", maxCount: 10 }]), async (req, res) => {
  console.log(req.body);
  console.log(req.files);

  const { name, description, price, quantity, category } = req.body

  if (!name || !description || !price || !quantity || !category) {
    return res.status(400).json({ error: "All fields are required." })
  }

  try {
    const imagePath = `/uploads/${req.files.image[0].filename}`
    const imagesArray = req.files.images
      ? req.files.images.map(file => `/uploads/${file.filename}`)
      : []

    const short_desc = description.slice(0, 30)

    const query = `
      INSERT INTO products (title, image, images, description, price, quantity, short_desc, cat_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `

    // Ejecutar la consulta con los datos
    db.query(
      query,
      [name, imagePath, JSON.stringify(imagesArray), description, price, quantity, short_desc, category],
      (err, result) => {
        if (err) {
          console.error(err)
          return res.status(500).json({ error: "Database error." })
        } else {

          const insertedProduct = {
            id: result.insertId,
            name,
            category,
            description,
            image: imagePath,
            images: imagesArray,
            price,
            quantity,
            short_desc,
          };

          return res.status(201).json({ message: "Product created successfully.", product: insertedProduct })
        }
      }
    )
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Server error." })
  }
})


// PUT A PRODUCT
router.put("/:id", multerUpload.fields([{ name: "image" }, { name: "images", maxCount: 10 }]), async (req, res) => {
  const { id } = req.params;
  const { name, description, price, quantity, category } = req.body;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "A valid product ID is required." });
  }

  if (!name || !description || !price || !quantity || !category) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const checkQuery = `SELECT * FROM products WHERE id = ?`;
    db.query(checkQuery, [id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error." });
      }

      if (result.length === 0) {
        return res.status(404).json({ error: "Product not found." });
      }

      let imagePath = result[0].image;
      if (req.files && req.files.image) {
        imagePath = `/uploads/${req.files.image[0].filename}`;
      }

      let imagesArray = result[0].images;
      if (req.files && req.files.images) {
        imagesArray = req.files.images.map(file => `/uploads/${file.filename}`);
      } else {
        imagesArray = JSON.parse(imagesArray);
      }

      const short_desc = description.slice(0, 30);

      const updateQuery = `
        UPDATE products
        SET title = ?, image = ?, images = ?, description = ?, price = ?, quantity = ?, short_desc = ?, cat_id = ?
        WHERE id = ?
      `;

      db.query(
        updateQuery,
        [name, imagePath, JSON.stringify(imagesArray), description, price, quantity, short_desc, category, id],
        (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database error." });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Product not found." });
          }

          return res.status(200).json({
            message: "Product updated successfully.",
            product: {
              id,
              name,
              category,
              description,
              image: imagePath,
              images: imagesArray,
              price,
              quantity,
              short_desc,
            },
          });
        }
      );
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error." });
  }
});


router.delete("/:id", (req, res) => {
  const { id } = req.params

  if (!id || isNaN(id)) {
    return res.status(400).json({
      message: "A valid product ID is required",
      statusCode: 400
    })
  }

  db.query(
    `DELETE FROM products WHERE id = ?`,
    [id],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: err.message || "Database error",
          statusCode: 500
        })
      } else if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Product not found",
          statusCode: 404
        })
      } else {
        return res.status(200).json({
          message: `Product with ID ${id} deleted successfully`,
          statusCode: 200
        })
      }
    }
  )
});


module.exports = router;
