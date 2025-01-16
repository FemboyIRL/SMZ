const { getCategories, createCategory, deleteCategory } = require("../services/categoryService")

exports.get_categories = async (req, res, next) => {
    try {
        const result = await getCategories()
        res.status(result.statusCode).json(result)
    } catch (err) {
        const { statusCode = 500, message } = err
        res.status(statusCode).json({ message })
    }
}

exports.create_category = async (req, res, next) => {
    const { title } = req.body
    createCategory({ title })
        .then((result) => res.status(result.statusCode).json(result))
        .catch((err) => {
            const { statusCode = 400, message } = err
            res.status(statusCode).json({ message })
        })
}

exports.delete_category = async (req, res, next) => {
    const { id } = req.params
    deleteCategory({ id })
        .then((result) => {
            res.status(result.statusCode).json(result)
        })
        .catch((err) => {
            const { statusCode = 400, message } = err
            res.status(statusCode).json({ message })
        })
}

