const db = require("../database/db");

exports.getAllProductsFromCategory = (req, res) => {
    const { categoryId } = req.params;

    console.log(categoryId)

    if (!categoryId || isNaN(categoryId)) {
        return res.status(400).json({ error: "Un ID de categoría válido es requerido." });
    }

    const query = `
      SELECT * FROM products WHERE cat_id = ?
    `;

    db.query(query, [categoryId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error en la base de datos." });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No se encontraron productos para esta categoría." });
        }

        return res.status(200).json({ products: results });
    });
};