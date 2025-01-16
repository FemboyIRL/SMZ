const db = require("../database/db");

exports.getCategories = async (params) => {
    return new Promise((resolve, reject) => {
        db.query(
            `SELECT * FROM categories`,
            [],
            (err, result) => {
                if (err) reject({ message: err, statusCode: 500 });

                if (result.length === 0)
                    reject({ message: "No categories were found", statusCode: 400 });

                resolve({
                    statusCode: 200,
                    message: `${result.length} categories were found`,
                    data: result,
                });
            }
        );
    });
};

exports.createCategory = async (params) => {
    const { title } = params;

    if (!title || title.trim() === "") {
        return Promise.reject({
            message: "The title field is required",
            statusCode: 400,
        });
    }

    return new Promise((resolve, reject) => {
        db.query(
            `INSERT INTO categories (title) VALUES (?)`,
            [title],
            (err, result) => {
                if (err) {
                    reject({ message: err.message || "Database error", statusCode: 500 });
                } else {
                    resolve({
                        statusCode: 201,
                        message: "Category created successfully",
                        data: { id: result.insertId, title },
                    });
                }
            }
        );
    });
};

exports.deleteCategory = async (params) => {
    const { id } = params

    // Validar que el ID esté presente y sea válido
    if (!id || isNaN(id)) {
        return Promise.reject({
            message: "A valid category ID is required",
            statusCode: 400
        })
    }

    return new Promise((resolve, reject) => {
        db.query(
            `DELETE FROM categories WHERE id = ?`,
            [id],
            (err, result) => {
                if (err) {
                    reject({ message: err.message || "Database error", statusCode: 500 })
                } else if (result.affectedRows === 0) {
                    reject({ message: "Category not found", statusCode: 404 })
                } else {
                    resolve({
                        statusCode: 200,
                        message: `Category with ID ${id} deleted successfully`
                    })
                }
            }
        )
    })
}