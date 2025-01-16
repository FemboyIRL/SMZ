const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

router.get("/", categoryController.get_categories);

router.post("/", categoryController.create_category);

router.delete("/:id", categoryController.delete_category)

module.exports = router;